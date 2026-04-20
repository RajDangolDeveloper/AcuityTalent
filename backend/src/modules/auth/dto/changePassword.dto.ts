import { IsString, IsStrongPassword, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @IsStrongPassword()
  newPassword: string;
}
