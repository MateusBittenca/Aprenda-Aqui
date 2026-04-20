import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateStudentUserDto } from './dto/create-student-user.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  // ─── Stats ────────────────────────────────────────────────────────────────

  @Get('stats')
  getStats() {
    return this.admin.getStats();
  }

  // ─── Users ────────────────────────────────────────────────────────────────

  @Get('users')
  listUsers() {
    return this.admin.listUsers();
  }

  @Post('users/admin')
  createAdminUser(@Body() dto: CreateAdminUserDto) {
    return this.admin.createAdminUser(dto);
  }

  @Post('users/student')
  createStudentUser(@Body() dto: CreateStudentUserDto) {
    return this.admin.createStudentUser(dto);
  }

  // ─── Courses ──────────────────────────────────────────────────────────────

  @Post('courses')
  createCourse(@Body() dto: CreateCourseDto) {
    return this.admin.createCourse(dto);
  }

  @Patch('courses/:courseId')
  updateCourse(
    @Param('courseId') courseId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.admin.updateCourse(courseId, dto);
  }

  // ─── Modules ──────────────────────────────────────────────────────────────

  @Post('modules')
  createModule(@Body() dto: CreateModuleDto) {
    return this.admin.createModule(dto);
  }

  // ─── Lessons ──────────────────────────────────────────────────────────────

  @Post('lessons')
  createLesson(@Body() dto: CreateLessonDto) {
    return this.admin.createLesson(dto);
  }

  @Get('lessons/:lessonId')
  getLesson(@Param('lessonId') lessonId: string) {
    return this.admin.getLessonAdmin(lessonId);
  }

  @Patch('lessons/:lessonId')
  updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.admin.updateLesson(lessonId, dto);
  }
}
