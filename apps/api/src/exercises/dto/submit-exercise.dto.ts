import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class SubmitExerciseDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  selectedIndex?: number;

  @IsOptional()
  @IsObject()
  blanks?: Record<string, string>;

  @IsOptional()
  @IsString()
  code?: string;
}
