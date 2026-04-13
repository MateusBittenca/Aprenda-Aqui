import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { SocialService } from './social.service';
import { UserPublicController } from './user-public.controller';
import { UsersService } from './users.service';
import { LeaderboardController, UsersController } from './users.controller';

@Module({
  imports: [CoursesModule],
  controllers: [UsersController, LeaderboardController, UserPublicController],
  providers: [UsersService, SocialService],
  exports: [UsersService, SocialService],
})
export class UsersModule {}
