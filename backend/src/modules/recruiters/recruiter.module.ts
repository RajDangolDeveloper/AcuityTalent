import { Module } from '@nestjs/common';
import { RecruiterController } from './recruiter.controller';
import { RecruiterService } from './recruiter.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [RecruiterController],
  providers: [RecruiterService, PrismaService],
  exports: [RecruiterService],
})
export class RecruiterModule {}
