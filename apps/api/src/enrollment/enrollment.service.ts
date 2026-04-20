import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async assertEnrolledInCourse(
    userId: string,
    courseId: string,
  ): Promise<void> {
    const byCourse = await this.prisma.userCourseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!byCourse) {
      throw new ForbiddenException(
        'Matricule-se no curso para acessar este conteúdo.',
      );
    }
  }
}
