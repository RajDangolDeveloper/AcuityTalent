import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PasswordService } from '../../config/password.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SpacesModule } from '../spaces/spaces.module';

@Module({
  imports: [SpacesModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, PasswordService, AdminGuard],
  exports: [UserService],
})
export class UserModule {}
