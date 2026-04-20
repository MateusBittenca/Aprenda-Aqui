import { Injectable } from '@nestjs/common';
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
    const [top, requestingUser, total] = await Promise.all([
      this.prisma.user.findMany({
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
      this.prisma.user.findUnique({
        where: { id: requestingUserId },
        select: { xpTotal: true },
      }),
      this.prisma.user.count(),
    ]);

    const myXp = requestingUser?.xpTotal ?? 0;
    const myRank =
      (await this.prisma.user.count({ where: { xpTotal: { gt: myXp } } })) + 1;

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
              modules: {
                orderBy: { orderIndex: 'asc' },
                include: {
                  lessons: {
                    orderBy: { orderIndex: 'asc' },
                    select: { id: true, title: true },
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
      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        tagline: course.tagline,
        enrolledAt,
        lessonPreview,
        nextLessonTitle,
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
    const streakWeekDays = await this.gamification.getRollingWeekActivity(
      userId,
      user.timezone,
    );
    return {
      ...user,
      streakWeekDays,
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
