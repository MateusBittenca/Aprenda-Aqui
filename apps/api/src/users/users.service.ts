import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { xpToNextLevel } from '../gamification/level.util';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamification: GamificationService,
  ) {}

  async getLeaderboard(requestingUserId: string) {
    // All three queries run in parallel — no sequential round-trips.
    // The rank is computed with a single COUNT in the same Promise.all,
    // avoiding the previous sequential await that caused connection-pool
    // exhaustion under concurrent load.
    const [top, rankRows, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'USER' },
        take: 20,
        orderBy: [{ xpTotal: 'desc' }, { level: 'desc' }],
        select: {
          id: true,
          displayName: true,
          avatarColorKey: true,
          xpTotal: true,
          level: true,
          currentStreak: true,
        },
      }),
      // Count how many USER-role accounts have strictly more XP than the
      // requesting user; rank = that count + 1.  A single SQL COUNT with a
      // correlated sub-select keeps this to one round-trip.
      this.prisma.$queryRaw<{ rank: bigint }[]>(
        Prisma.sql`
          SELECT COUNT(*) AS \`rank\`
          FROM \`User\` AS u2
          WHERE u2.role = 'USER'
            AND u2.xpTotal > COALESCE(
              (SELECT xpTotal FROM \`User\` WHERE id = ${requestingUserId}),
              0
            )
        `,
      ),
      this.prisma.user.count({ where: { role: 'USER' } }),
    ]);

    // $queryRaw returns BigInt for COUNT — convert to a plain number.
    const myRank = Number(rankRows[0]?.rank ?? 0) + 1;

    return { top, myRank, total };
  }

  async getEnrolledCoursesWithProgress(userId: string) {
    const [courseEnrollments, completedLessons] = await Promise.all([
      this.prisma.userCourseEnrollment.findMany({
        where: { userId },
        orderBy: { enrolledAt: 'desc' },
        include: {
          course: {
            include: {
              _count: { select: { enrollments: true } },
              modules: {
                orderBy: { orderIndex: 'asc' },
                include: {
                  lessons: {
                    orderBy: { orderIndex: 'asc' },
                    select: {
                      id: true,
                      title: true,
                      estimatedMinutes: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.userLessonProgress.findMany({
        where: { userId, completed: true },
        select: { lessonId: true },
      }),
    ]);

    const completedSet = new Set(completedLessons.map((l) => l.lessonId));

    const seenCourseIds = new Set<string>();
    const rows: {
      course: (typeof courseEnrollments)[0]['course'];
      enrolledAt: Date;
    }[] = [];

    for (const e of courseEnrollments) {
      if (!seenCourseIds.has(e.course.id)) {
        seenCourseIds.add(e.course.id);
        rows.push({ course: e.course, enrolledAt: e.enrolledAt });
      }
    }

    rows.sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime());

    return rows.map(({ course, enrolledAt }) => {
      const orderedLessons = course.modules.flatMap((m) => m.lessons);
      const allLessonIds = orderedLessons.map((l) => l.id);
      const completed = allLessonIds.filter((id) =>
        completedSet.has(id),
      ).length;
      const total = allLessonIds.length;
      const lessonPreview = orderedLessons.slice(0, 3).map((l) => l.title);
      const nextLesson = orderedLessons.find((l) => !completedSet.has(l.id));
      const nextLessonTitle = nextLesson ? nextLesson.title : null;
      const totalMinutes = orderedLessons.reduce(
        (acc, l) => acc + (l.estimatedMinutes ?? 0),
        0,
      );
      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        tagline: course.tagline,
        difficulty: course.difficulty,
        enrolledAt,
        lessonPreview,
        nextLessonTitle,
        enrollmentCount: course._count.enrollments,
        moduleCount: course.modules.length,
        stats: {
          lessonCount: total,
          totalMinutes,
        },
        progress: {
          completed,
          total,
          pct: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      };
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        timezone: true,
        bio: true,
        showInSearch: true,
        avatarColorKey: true,
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
    const [streakWeekDays, followerCount, followingCount] = await Promise.all([
      this.gamification.getRollingWeekActivity(userId, user.timezone),
      this.prisma.userFollow.count({ where: { followingId: userId } }),
      this.prisma.userFollow.count({ where: { followerId: userId } }),
    ]);
    return {
      ...user,
      streakWeekDays,
      followerCount,
      followingCount,
      xpProgress: {
        level: band.level,
        currentBandXp: band.currentBandXp,
        bandSize: band.bandSize,
      },
    };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const data = {
      ...(dto.displayName !== undefined && { displayName: dto.displayName }),
      ...(dto.timezone !== undefined && { timezone: dto.timezone }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.showInSearch !== undefined && { showInSearch: dto.showInSearch }),
      ...(dto.avatarColorKey !== undefined && { avatarColorKey: dto.avatarColorKey }),
    };
    if (Object.keys(data).length > 0) {
      await this.prisma.user.update({ where: { id: userId }, data });
    }
    return this.getProfile(userId);
  }
}
