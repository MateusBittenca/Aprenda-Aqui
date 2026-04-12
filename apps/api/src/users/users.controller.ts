import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

@Controller('me')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  me(@CurrentUser() user: JwtUser) {
    return this.users.getProfile(user.userId);
  }

  @Get('gamification')
  gamification(@CurrentUser() user: JwtUser) {
    return this.users.getGamification(user.userId);
  }
}
