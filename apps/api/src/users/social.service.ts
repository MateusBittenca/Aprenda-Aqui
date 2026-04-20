import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { xpToNextLevel } from '../gamification/level.util';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async searchUsers(viewerId: string, q: string) {
    const term = q.trim();
    if (term.length < 2) {
      return [];
    }
    const rows = await this.prisma.user.findMany({
      where: {
        id: { not: viewerId },
        role: 'USER',
        showInSearch: true,
        displayName: { contains: term },
      },
      select: {
        id: true,
        displayName: true,
        avatarColorKey: true,
        level: true,
        xpTotal: true,
      },
      take: 20,
      orderBy: { displayName: 'asc' },
    });
    return rows;
  }

  private async activityCounts(userId: string) {
    const [completedLessons, solvedExercises] = await Promise.all([
      this.prisma.userLessonProgress.count({
        where: { userId, completed: true },
      }),
      this.prisma.userExerciseProgress.count({
        where: { userId, solved: true },
      }),
    ]);
    return { completedLessons, solvedExercises };
  }

  async getPublicProfile(targetId: string, viewerId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: targetId, role: 'USER' },
      select: {
        id: true,
        displayName: true,
        bio: true,
        xpTotal: true,
        level: true,
        gems: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const [followerCount, followingCount, activity, xpBand] = await Promise.all(
      [
        this.prisma.userFollow.count({ where: { followingId: targetId } }),
        this.prisma.userFollow.count({ where: { followerId: targetId } }),
        this.activityCounts(targetId),
        Promise.resolve(xpToNextLevel(user.xpTotal)),
      ],
    );

    const isSelf = targetId === viewerId;
    let isFollowing: boolean | undefined;
    if (!isSelf) {
      const link = await this.prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: targetId,
          },
        },
      });
      isFollowing = !!link;
    }

    return {
      ...user,
      ...activity,
      followerCount,
      followingCount,
      xpProgress: {
        level: xpBand.level,
        currentBandXp: xpBand.currentBandXp,
        bandSize: xpBand.bandSize,
      },
      isSelf,
      isFollowing,
    };
  }

  async compareUsers(viewerId: string, targetId: string) {
    if (viewerId === targetId) {
      throw new BadRequestException('Escolha outra pessoa para comparar');
    }
    const [a, b] = await Promise.all([
      this.getPublicProfile(viewerId, viewerId),
      this.getPublicProfile(targetId, viewerId),
    ]);
    return {
      you: a,
      them: b,
    };
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Você não pode seguir a si mesmo');
    }
    const target = await this.prisma.user.findFirst({
      where: { id: followingId, role: 'USER' },
      select: { id: true },
    });
    if (!target) throw new NotFoundException('Usuário não encontrado');
    try {
      await this.prisma.userFollow.create({
        data: { followerId, followingId },
      });
    } catch {
      throw new ConflictException('Já está seguindo este usuário');
    }
    return { following: true };
  }

  async unfollow(followerId: string, followingId: string) {
    try {
      await this.prisma.userFollow.delete({
        where: { followerId_followingId: { followerId, followingId } },
      });
    } catch {
      throw new NotFoundException('Não estava seguindo este usuário');
    }
    return { following: false };
  }

  async listFollowers(userId: string, viewerId: string, take = 50) {
    const rows = await this.prisma.userFollow.findMany({
      where: { followingId: userId },
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: {
            id: true,
            displayName: true,
            avatarColorKey: true,
            level: true,
            xpTotal: true,
          },
        },
      },
    });
    const followingSet = new Set(
      (
        await this.prisma.userFollow.findMany({
          where: {
            followerId: viewerId,
            followingId: { in: rows.map((r) => r.followerId) },
          },
          select: { followingId: true },
        })
      ).map((x) => x.followingId),
    );
    return rows.map((r) => ({
      ...r.follower,
      viewerFollowsThem: followingSet.has(r.followerId),
    }));
  }

  async listFollowing(userId: string, viewerId: string, take = 50) {
    const rows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: {
            id: true,
            displayName: true,
            avatarColorKey: true,
            level: true,
            xpTotal: true,
          },
        },
      },
    });
    const followingSet = new Set(
      (
        await this.prisma.userFollow.findMany({
          where: {
            followerId: viewerId,
            followingId: { in: rows.map((r) => r.followingId) },
          },
          select: { followingId: true },
        })
      ).map((x) => x.followingId),
    );
    return rows.map((r) => ({
      ...r.following,
      viewerFollowsThem: followingSet.has(r.followingId),
    }));
  }
}
