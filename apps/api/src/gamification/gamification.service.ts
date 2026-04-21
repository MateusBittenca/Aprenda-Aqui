import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { levelFromTotalXp } from './level.util';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra estudo no dia civil do usuário (fuso em `User.timezone`, fallback UTC)
   * e atualiza sequência — alinhado a apps como Duolingo (meia-noite local).
   */
  async recordDailyActivity(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const tz = this.safeTimeZone(user.timezone);
    const now = new Date();
    const todayYmd = this.calendarDateInTimeZone(now, tz);
    const lastYmd = user.lastActivityDate
      ? this.calendarDateInTimeZone(user.lastActivityDate, tz)
      : null;

    let nextStreak = user.currentStreak;
    if (!lastYmd) {
      nextStreak = Math.max(1, user.currentStreak || 1);
    } else {
      const diffDays = this.civilDaysBetween(lastYmd, todayYmd);
      if (diffDays === 0) {
        nextStreak = Math.max(user.currentStreak || 0, 1);
      } else if (diffDays === 1) {
        nextStreak = (user.currentStreak || 0) + 1;
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

  /** Últimos 7 dias civis (do mais antigo ao hoje): true se houve atividade qualificante naquele dia. */
  async getRollingWeekActivity(
    userId: string,
    timeZone: string,
  ): Promise<boolean[]> {
    const tz = this.safeTimeZone(timeZone);
    const now = new Date();
    const todayYmd = this.calendarDateInTimeZone(now, tz);
    const weekKeys = Array.from({ length: 7 }, (_, i) =>
      this.addDaysYmd(todayYmd, i - 6),
    );
    const since = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    const [attempts, lessons] = await Promise.all([
      this.prisma.userExerciseAttempt.findMany({
        where: { userId, correct: true, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      this.prisma.userLessonProgress.findMany({
        where: {
          userId,
          completed: true,
          completedAt: { not: null, gte: since },
        },
        select: { completedAt: true },
      }),
    ]);

    const active = new Set<string>();
    for (const a of attempts) {
      active.add(this.calendarDateInTimeZone(a.createdAt, tz));
    }
    for (const l of lessons) {
      if (l.completedAt)
        active.add(this.calendarDateInTimeZone(l.completedAt, tz));
    }

    return weekKeys.map((k) => active.has(k));
  }

  /** Debita gemas (ex.: desbloquear explicação). Lança se o saldo for insuficiente. */
  async spendGems(
    userId: string,
    amount: number,
  ): Promise<{ gemsRemaining: number }> {
    if (!Number.isFinite(amount) || amount < 1) {
      throw new BadRequestException('Quantidade de gemas inválida');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (user.gems < amount) {
      throw new BadRequestException('Gemas insuficientes');
    }
    const gemsRemaining = user.gems - amount;
    await this.prisma.user.update({
      where: { id: userId },
      data: { gems: gemsRemaining },
    });
    return { gemsRemaining };
  }

  async applyXpAndGems(
    userId: string,
    xp: number,
    gems: number,
  ): Promise<{
    xpGained: number;
    gemsGained: number;
    level: number;
    xpTotal: number;
    previousLevel: number;
    leveledUp: boolean;
  }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const previousLevel = user.level;
    const xpTotal = user.xpTotal + xp;
    const gemsTotal = user.gems + gems;
    const level = levelFromTotalXp(xpTotal);

    await this.prisma.user.update({
      where: { id: userId },
      data: { xpTotal, gems: gemsTotal, level },
    });

    await this.recordDailyActivity(userId);

    return {
      xpGained: xp,
      gemsGained: gems,
      level,
      xpTotal,
      previousLevel,
      leveledUp: level > previousLevel,
    };
  }

  private safeTimeZone(tz: string | null | undefined): string {
    if (!tz || !String(tz).trim()) return 'UTC';
    const s = String(tz).trim();
    try {
      Intl.DateTimeFormat(undefined, { timeZone: s });
      return s;
    } catch {
      return 'UTC';
    }
  }

  private calendarDateInTimeZone(d: Date, timeZone: string): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d);
    const y = parts.find((p) => p.type === 'year')!.value;
    const m = parts.find((p) => p.type === 'month')!.value;
    const day = parts.find((p) => p.type === 'day')!.value;
    return `${y}-${m}-${day}`;
  }

  private addDaysYmd(ymd: string, delta: number): string {
    const [y, m, d] = ymd.split('-').map(Number);
    const t = Date.UTC(y, m - 1, d) + delta * 86400000;
    const u = new Date(t);
    const yy = u.getUTCFullYear();
    const mm = String(u.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(u.getUTCDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }

  private civilDaysBetween(earlierYmd: string, laterYmd: string): number {
    const [y1, m1, d1] = earlierYmd.split('-').map(Number);
    const [y2, m2, d2] = laterYmd.split('-').map(Number);
    return Math.round(
      (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000,
    );
  }
}
