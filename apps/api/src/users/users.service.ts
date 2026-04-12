import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { xpToNextLevel } from '../gamification/level.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        timezone: true,
        xpTotal: true,
        level: true,
        gems: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
        createdAt: true,
      },
    });
    const band = xpToNextLevel(user.xpTotal);
    return {
      ...user,
      xpProgress: {
        level: band.level,
        currentBandXp: band.currentBandXp,
        bandSize: band.bandSize,
      },
    };
  }

  async getGamification(userId: string) {
    return this.getProfile(userId);
  }
}
