import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { ProgressService } from './progress.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get('me/progress')
  myProgress(@CurrentUser() user: JwtUser) {
    return this.progress.getProgress(user.userId);
  }

  @Post('lessons/:lessonId/complete')
  completeLesson(@CurrentUser() user: JwtUser, @Param('lessonId') lessonId: string) {
    return this.progress.completeLesson(user.userId, lessonId);
  }
}
