import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CatalogService } from '../catalog/catalog.service';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersService } from './users.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly catalog: CatalogService,
  ) {}

  @Get()
  me(@CurrentUser() user: JwtUser) {
    return this.users.getProfile(user.userId);
  }

  @Patch()
  patchMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(user.userId, dto);
  }

  @Get('enrolled-courses')
  enrolledCourses(@CurrentUser() user: JwtUser) {
    return this.users.getEnrolledCoursesWithProgress(user.userId);
  }

  @Get('courses/catalog')
  listCatalog(@CurrentUser() user: JwtUser) {
    return this.catalog.listCatalogForUser(user.userId);
  }

  @Get('courses/:courseId')
  getCourse(@CurrentUser() user: JwtUser, @Param('courseId') courseId: string) {
    return this.catalog.getCourseForUser(courseId, user.userId);
  }
}

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly users: UsersService) {}

  @Get()
  getLeaderboard(@CurrentUser() user: JwtUser) {
    return this.users.getLeaderboard(user.userId);
  }
}
