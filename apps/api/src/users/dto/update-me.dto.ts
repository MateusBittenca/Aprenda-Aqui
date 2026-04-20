import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AVATAR_COLOR_KEYS } from '../avatar-color.constants';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @IsOptional()
  @IsBoolean()
  showInSearch?: boolean;

  @IsOptional()
  @IsIn([...AVATAR_COLOR_KEYS])
  avatarColorKey?: string;
}
