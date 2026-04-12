import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { levelFromTotalXp } from './level.util';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  /** Registra atividade no dia atual (UTC) e atualiza streak. */
  async recordDailyActivity(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const now = new Date();
    const todayUtc = this.startOfUtcDay(now);
    const last = user.lastActivityDate ? this.startOfUtcDay(user.lastActivityDate) : null;

    let nextStreak = user.currentStreak;
    if (!last) {
      nextStreak = 1;
    } else {
      const diffDays = Math.round((todayUtc.getTime() - last.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays === 0) {
        nextStreak = user.currentStreak || 1;
      } else if (diffDays === 1) {
        nextStreak = user.currentStreak + 1;
      } else {
        nextStreak = 1;
      }
    }

    const longest = Math.max(user.longestStreak, nextStreak);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastActivityDate: now,
        currentStreak: nextStreak,
        longestStreak: longest,
      },
    });
  }

  async applyXpAndGems(
    userId: string,
    xp: number,
    gems: number,
  ): Promise<{ xpGained: number; gemsGained: number; level: number; xpTotal: number }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const xpTotal = user.xpTotal + xp;
    const gemsTotal = user.gems + gems;
    const level = levelFromTotalXp(xpTotal);

    await this.prisma.user.update({
      where: { id: userId },
      data: { xpTotal, gems: gemsTotal, level },
    });

    await this.recordDailyActivity(userId);

    return { xpGained: xp, gemsGained: gems, level, xpTotal };
  }

  private startOfUtcDay(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
}
