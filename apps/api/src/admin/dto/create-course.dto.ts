import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug deve ser minúsculo, com hífens (ex.: meu-curso)',
  })
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

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

  /** Se true (padrão), matrícula automática no login para usuários existentes e novos cadastros. */
  @IsOptional()
  @IsBoolean()
  autoEnrollOnAuth?: boolean;
}
