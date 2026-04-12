import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogModule } from './catalog/catalog.module';
import { LessonsModule } from './lessons/lessons.module';
import { ExercisesModule } from './exercises/exercises.module';
import { ProgressModule } from './progress/progress.module';
import { GamificationModule } from './gamification/gamification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GamificationModule,
    AuthModule,
    UsersModule,
    CatalogModule,
    LessonsModule,
    ProgressModule,
    ExercisesModule,
  ],
})
export class AppModule {}
