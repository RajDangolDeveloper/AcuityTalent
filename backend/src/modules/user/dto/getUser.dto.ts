import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetUser {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;
}
