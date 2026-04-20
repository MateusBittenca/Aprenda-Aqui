import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  tagline?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverImageUrl?: string | null;

  @IsOptional()
  @IsString()
  overviewMd?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsBoolean()
  autoEnrollOnAuth?: boolean;
}
