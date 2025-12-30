import { IsEmail, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyOtpDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'OTP must be a valid number' },
  )
  otp: number;
}
