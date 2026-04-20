import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @MinLength(1)
  courseId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug deve ser minúsculo, com hífens (ex.: modulo-1)',
  })
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
