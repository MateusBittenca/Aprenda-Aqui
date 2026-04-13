import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { CoursesService } from './courses.service';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.courses.listForUser(user.userId);
  }

  @Post(':courseId/enroll')
  enroll(@CurrentUser() user: JwtUser, @Param('courseId') courseId: string) {
    return this.courses.enroll(user.userId, courseId);
  }
}
