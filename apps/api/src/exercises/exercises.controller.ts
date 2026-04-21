import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
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

  @Post(':exerciseId/reveal-explanation')
  revealExplanation(
    @CurrentUser() user: JwtUser,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.exercises.revealExplanation(user.userId, exerciseId);
  }
}
