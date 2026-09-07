import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgetPasswordDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email!: string;
}
