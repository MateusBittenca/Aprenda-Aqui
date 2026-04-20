import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateStudentUserDto } from './dto/create-student-user.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [users, admins, courses, lessons] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.course.count(),
      this.prisma.lesson.count(),
    ]);
    return { users, admins, courses, lessons };
  }

  // ─── Users ──────────────────────────────────────────────────────────────────

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        level: true,
        xpTotal: true,
        gems: true,
        currentStreak: true,
        createdAt: true,
      },
    });
  }

  async createAdminUser(dto: CreateAdminUserDto) {
    return this.createUser(dto, UserRole.ADMIN);
  }

  async createStudentUser(dto: CreateStudentUserDto) {
    return this.createUser(dto, UserRole.USER);
  }

  private async createUser(
    dto: { email: string; password: string; displayName: string },
    role: UserRole,
  ) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { email, passwordHash, displayName: dto.displayName, role },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // ─── Courses ─────────────────────────────────────────────────────────────────

  async createCourse(dto: CreateCourseDto) {
    const clash = await this.prisma.course.findUnique({
      where: { slug: dto.slug },
    });
    if (clash) throw new ConflictException('Já existe um curso com este slug');

    const maxIdx = await this.prisma.course.aggregate({
      _max: { orderIndex: true },
    });
    const orderIndex = dto.orderIndex ?? (maxIdx._max.orderIndex ?? -1) + 1;
    const isFree = dto.isFree ?? true;
    const autoEnrollOnAuth = dto.autoEnrollOnAuth ?? true;

    const course = await this.prisma.course.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        description: dto.description ?? null,
        tagline: dto.tagline ?? null,
        coverImageUrl: dto.coverImageUrl ?? null,
        overviewMd: dto.overviewMd ?? null,
        orderIndex,
        isFree,
        autoEnrollOnAuth,
      },
    });
    if (isFree && autoEnrollOnAuth)
      await this.enrollAllUsersInCourse(course.id);
    return course;
  }

  async updateCourse(courseId: string, dto: UpdateCourseDto) {
    const existing = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!existing) throw new NotFoundException('Curso não encontrado');
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.tagline !== undefined && { tagline: dto.tagline }),
        ...(dto.coverImageUrl !== undefined && {
          coverImageUrl: dto.coverImageUrl,
        }),
        ...(dto.overviewMd !== undefined && { overviewMd: dto.overviewMd }),
        ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
        ...(dto.isFree !== undefined && { isFree: dto.isFree }),
        ...(dto.autoEnrollOnAuth !== undefined && {
          autoEnrollOnAuth: dto.autoEnrollOnAuth,
        }),
      },
    });
  }

  private async enrollAllUsersInCourse(courseId: string) {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    if (users.length === 0) return;
    await this.prisma.userCourseEnrollment.createMany({
      data: users.map((u) => ({ userId: u.id, courseId })),
      skipDuplicates: true,
    });
  }

  // ─── Modules ─────────────────────────────────────────────────────────────────

  async createModule(dto: CreateModuleDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException('Curso não encontrado');

    const clash = await this.prisma.module.findUnique({
      where: { courseId_slug: { courseId: course.id, slug: dto.slug } },
    });
    if (clash)
      throw new ConflictException(
        'Já existe um módulo com este slug neste curso',
      );

    const maxIdx = await this.prisma.module.aggregate({
      where: { courseId: course.id },
      _max: { orderIndex: true },
    });
    const orderIndex = dto.orderIndex ?? (maxIdx._max.orderIndex ?? -1) + 1;
    return this.prisma.module.create({
      data: {
        courseId: course.id,
        slug: dto.slug,
        title: dto.title,
        orderIndex,
      },
    });
  }

  // ─── Lessons ─────────────────────────────────────────────────────────────────

  async createLesson(dto: CreateLessonDto) {
    const mod = await this.prisma.module.findUnique({
      where: { id: dto.moduleId },
    });
    if (!mod) throw new NotFoundException('Módulo não encontrado');

    const clash = await this.prisma.lesson.findUnique({
      where: { moduleId_slug: { moduleId: mod.id, slug: dto.slug } },
    });
    if (clash)
      throw new ConflictException(
        'Já existe uma aula com este slug neste módulo',
      );

    const maxIdx = await this.prisma.lesson.aggregate({
      where: { moduleId: mod.id },
      _max: { orderIndex: true },
    });
    const orderIndex = dto.orderIndex ?? (maxIdx._max.orderIndex ?? -1) + 1;

    return this.prisma.lesson.create({
      data: {
        moduleId: mod.id,
        slug: dto.slug,
        title: dto.title,
        objective: dto.objective ?? null,
        contentMd: dto.contentMd ?? '',
        estimatedMinutes: dto.estimatedMinutes ?? 3,
        orderIndex,
      },
    });
  }

  async getLessonAdmin(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: { include: { course: true } },
        exercises: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!lesson) throw new NotFoundException('Aula não encontrada');
    return lesson;
  }

  async updateLesson(lessonId: string, dto: UpdateLessonDto) {
    const existing = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!existing) throw new NotFoundException('Aula não encontrada');

    if (dto.slug !== undefined && dto.slug !== existing.slug) {
      const clash = await this.prisma.lesson.findFirst({
        where: {
          moduleId: existing.moduleId,
          slug: dto.slug,
          NOT: { id: lessonId },
        },
      });
      if (clash)
        throw new ConflictException(
          'Já existe uma aula com este slug neste módulo',
        );
    }

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.objective !== undefined && { objective: dto.objective }),
        ...(dto.contentMd !== undefined && { contentMd: dto.contentMd }),
        ...(dto.estimatedMinutes !== undefined && {
          estimatedMinutes: dto.estimatedMinutes,
        }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
      },
    });
  }
}
