import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PasswordService } from 'src/config/password.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, PasswordService],
  exports: [UserService],
})
export class UserModule {}
