import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { ExerciseEvaluatorService } from './exercise-evaluator.service';
import { ProgressModule } from '../progress/progress.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [ProgressModule, GamificationModule],
  controllers: [ExercisesController],
  providers: [ExercisesService, ExerciseEvaluatorService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
