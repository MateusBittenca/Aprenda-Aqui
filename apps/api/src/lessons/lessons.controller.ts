import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { LessonsService } from './lessons.service';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get(':lessonId')
  getLesson(@Param('lessonId') lessonId: string, @CurrentUser() user: JwtUser) {
    return this.lessons.getLesson(lessonId, user.userId);
  }
}
