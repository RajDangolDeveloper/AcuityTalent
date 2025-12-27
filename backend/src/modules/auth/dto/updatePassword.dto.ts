import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePasswordDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @IsString()
  @MinLength(6)
  @IsStrongPassword()
  passwordHash: string;
}
