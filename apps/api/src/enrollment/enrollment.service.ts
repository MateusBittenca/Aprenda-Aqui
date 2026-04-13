import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async assertEnrolledInCourse(userId: string, courseId: string): Promise<void> {
    const byCourse = await this.prisma.userCourseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (byCourse) return;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { trackId: true },
    });
    if (!course) {
      throw new ForbiddenException('Matricule-se na trilha ou no curso para acessar este conteúdo.');
    }

    const byTrack = await this.prisma.userTrackEnrollment.findUnique({
      where: { userId_trackId: { userId, trackId: course.trackId } },
    });
    if (byTrack) return;

    throw new ForbiddenException('Matricule-se na trilha para acessar este conteúdo.');
  }
}
