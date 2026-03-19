import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteUser {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;
}
