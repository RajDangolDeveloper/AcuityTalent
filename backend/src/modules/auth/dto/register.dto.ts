import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @IsString()
  @MinLength(6)
  @IsStrongPassword()
  passwordHash: string;

  @IsEnum(Role)
  role: Role;
}
