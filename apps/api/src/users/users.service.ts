import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { withTrackPresentation } from '../catalog/track-detail.util';
import { xpToNextLevel } from '../gamification/level.util';
import { UpdateMeDto } from './dto/update-me.dto';

const trackCourseDetailInclude = {
  orderBy: { orderIndex: 'asc' as const },
  select: {
    id: true,
    slug: true,
    title: true,
    description: true,
    orderIndex: true,
    isFree: true,
    modules: {
      orderBy: { orderIndex: 'asc' as const },
      select: {
        id: true,
        slug: true,
        title: true,
        orderIndex: true,
        lessons: {
          orderBy: { orderIndex: 'asc' as const },
          select: {
            id: true,
            slug: true,
            title: true,
            estimatedMinutes: true,
            orderIndex: true,
            _count: { select: { exercises: true } },
          },
        },
      },
    },
  },
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(requestingUserId: string) {
    const [top, requestingUser, total] = await Promise.all([
      this.prisma.user.findMany({
        take: 20,
        orderBy: [{ xpTotal: 'desc' }, { level: 'desc' }],
        select: {
          id: true,
          displayName: true,
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
    const [courseEnrollments, trackEnrollments, completedLessons] = await Promise.all([
      this.prisma.userCourseEnrollment.findMany({
        where: { userId },
        orderBy: { enrolledAt: 'desc' },
        include: {
          course: {
            include: {
              track: true,
              modules: {
                orderBy: { orderIndex: 'asc' },
                include: { lessons: { select: { id: true } } },
              },
            },
          },
        },
      }),
      this.prisma.userTrackEnrollment.findMany({
        where: { userId },
        orderBy: { enrolledAt: 'desc' },
        include: {
          track: {
            include: {
              courses: {
                orderBy: { orderIndex: 'asc' },
                include: {
                  track: true,
                  modules: {
                    orderBy: { orderIndex: 'asc' },
                    include: { lessons: { select: { id: true } } },
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

    for (const te of trackEnrollments) {
      for (const c of te.track.courses) {
        if (!seenCourseIds.has(c.id)) {
          seenCourseIds.add(c.id);
          rows.push({ course: c, enrolledAt: te.enrolledAt });
        }
      }
    }

    rows.sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime());

    return rows.map(({ course, enrolledAt }) => {
      const allLessons = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      const completed = allLessons.filter((id) => completedSet.has(id)).length;
      const total = allLessons.length;
      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        track: {
          id: course.track.id,
          slug: course.track.slug,
          title: course.track.title,
        },
        enrolledAt,
        progress: {
          completed,
          total,
          pct: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      };
    });
  }

  /** Catálogo: todas as trilhas + flag se o usuário já se matriculou na trilha. */
  async listCatalogTracks(userId: string) {
    const [tracks, mine, courses] = await Promise.all([
      this.prisma.track.findMany({
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          tagline: true,
          orderIndex: true,
          _count: { select: { courses: true } },
        },
      }),
      this.prisma.userTrackEnrollment.findMany({
        where: { userId },
        select: { trackId: true },
      }),
      this.prisma.course.findMany({ select: { trackId: true, isFree: true } }),
    ]);
    const enrolledSet = new Set(mine.map((m) => m.trackId));
    const countsByTrack = new Map<string, { free: number; paid: number }>();
    for (const c of courses) {
      const cur = countsByTrack.get(c.trackId) ?? { free: 0, paid: 0 };
      if (c.isFree) cur.free += 1;
      else cur.paid += 1;
      countsByTrack.set(c.trackId, cur);
    }
    return tracks.map((t) => {
      const { free, paid } = countsByTrack.get(t.id) ?? { free: 0, paid: 0 };
      return {
        ...t,
        enrolled: enrolledSet.has(t.id),
        freeCourseCount: free,
        paidCourseCount: paid,
        canEnrollInTrack: free > 0,
      };
    });
  }

  /** Minhas trilhas: só matrícula explícita na trilha (`UserTrackEnrollment`). */
  async listTracksForUser(userId: string) {
    const rows = await this.prisma.userTrackEnrollment.findMany({
      where: { userId },
      include: {
        track: {
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            tagline: true,
            orderIndex: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const withCounts = await Promise.all(
      rows.map(async (r) => {
        const trackId = r.track.id;
        const courses = await this.prisma.course.count({ where: { trackId } });
        const lessons = await this.prisma.lesson.count({
          where: { module: { course: { trackId } } },
        });
        const completedLessons = await this.prisma.userLessonProgress.count({
          where: {
            userId,
            completed: true,
            lesson: { module: { course: { trackId } } },
          },
        });
        const completed = lessons > 0 && completedLessons === lessons;
        return {
          ...r.track,
          _count: { courses, lessons },
          completed,
        };
      }),
    );

    return withCounts.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  /** Conteúdo da trilha para estudo: exige matrícula na trilha. */
  async getTrackForUser(trackId: string, userId: string) {
    const trackRef = await this.prisma.track.findFirst({
      where: { OR: [{ id: trackId }, { slug: trackId }] },
      select: { id: true },
    });
    if (!trackRef) throw new NotFoundException('Trilha não encontrada');

    const trackEnrolled = await this.prisma.userTrackEnrollment.findUnique({
      where: { userId_trackId: { userId, trackId: trackRef.id } },
    });
    if (!trackEnrolled) {
      throw new NotFoundException('Trilha não encontrada');
    }

    const track = await this.prisma.track.findUnique({
      where: { id: trackRef.id },
      include: {
        _count: { select: { enrollments: true } },
        courses: {
          ...trackCourseDetailInclude,
        },
      },
    });
    if (!track) throw new NotFoundException('Trilha não encontrada');

    const courseIds = track.courses.map((c) => c.id);
    const courseEnrolls = await this.prisma.userCourseEnrollment.findMany({
      where: { userId, courseId: { in: courseIds } },
      select: { courseId: true },
    });
    const enrolledCourseIds = new Set(courseEnrolls.map((e) => e.courseId));

    const presented = withTrackPresentation(track);

    return {
      ...presented,
      courses: presented.courses.map((c) => ({
        ...c,
        accessible: c.isFree || enrolledCourseIds.has(c.id),
      })),
    };
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

  async updateMe(userId: string, dto: UpdateMeDto) {
    const data = {
      ...(dto.displayName !== undefined && { displayName: dto.displayName }),
      ...(dto.timezone !== undefined && { timezone: dto.timezone }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.showInSearch !== undefined && { showInSearch: dto.showInSearch }),
    };
    if (Object.keys(data).length > 0) {
      await this.prisma.user.update({ where: { id: userId }, data });
    }
    return this.getProfile(userId);
  }
}
