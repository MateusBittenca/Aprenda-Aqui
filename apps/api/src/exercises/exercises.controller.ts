import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
@UseGuards(AuthGuard('jwt'))
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  @Post(':exerciseId/submit')
  submit(
    @CurrentUser() user: JwtUser,
    @Param('exerciseId') exerciseId: string,
    @Body() body: SubmitExerciseDto,
  ) {
    return this.exercises.submit(user.userId, exerciseId, body);
  }
}
