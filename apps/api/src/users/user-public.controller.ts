import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { SocialService } from './social.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserPublicController {
  constructor(private readonly social: SocialService) {}

  @Get('search')
  search(@CurrentUser() user: JwtUser, @Query('q') q: string) {
    return this.social.searchUsers(user.userId, q ?? '');
  }

  @Get(':userId/compare')
  compare(@CurrentUser() user: JwtUser, @Param('userId') userId: string) {
    return this.social.compareUsers(user.userId, userId);
  }

  @Get(':userId/followers')
  followers(@CurrentUser() user: JwtUser, @Param('userId') userId: string) {
    return this.social.listFollowers(userId, user.userId);
  }

  @Get(':userId/following')
  following(@CurrentUser() user: JwtUser, @Param('userId') userId: string) {
    return this.social.listFollowing(userId, user.userId);
  }

  @Post(':userId/follow')
  follow(@CurrentUser() user: JwtUser, @Param('userId') userId: string) {
    return this.social.follow(user.userId, userId);
  }

  @Delete(':userId/follow')
  unfollow(@CurrentUser() user: JwtUser, @Param('userId') userId: string) {
    return this.social.unfollow(user.userId, userId);
  }

  @Get(':userId')
  profile(@CurrentUser() user: JwtUser, @Param('userId') userId: string) {
    return this.social.getPublicProfile(userId, user.userId);
  }
}
