import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { GamificationModule } from '../gamification/gamification.module';
import { SocialService } from './social.service';
import { UserPublicController } from './user-public.controller';
import { UsersService } from './users.service';
import { LeaderboardController, UsersController } from './users.controller';

@Module({
  imports: [CatalogModule, GamificationModule],
  controllers: [UsersController, LeaderboardController, UserPublicController],
  providers: [UsersService, SocialService],
  exports: [UsersService, SocialService],
})
export class UsersModule {}
