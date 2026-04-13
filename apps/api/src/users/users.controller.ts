import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { CoursesService } from '../courses/courses.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersService } from './users.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly courses: CoursesService,
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

  @Get('tracks/catalog')
  listCatalog(@CurrentUser() user: JwtUser) {
    return this.users.listCatalogTracks(user.userId);
  }

  @Get('tracks')
  listTracks(@CurrentUser() user: JwtUser) {
    return this.users.listTracksForUser(user.userId);
  }

  @Get('tracks/:trackId')
  getTrack(@CurrentUser() user: JwtUser, @Param('trackId') trackId: string) {
    return this.users.getTrackForUser(trackId, user.userId);
  }

  @Post('tracks/:trackId/enroll')
  enrollTrack(@CurrentUser() user: JwtUser, @Param('trackId') trackId: string) {
    return this.courses.enrollInTrack(user.userId, trackId);
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
