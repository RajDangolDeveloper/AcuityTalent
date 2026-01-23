import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * ResumeModule - Encapsulates all resume management functionality
 * Dependencies: Prisma (database)
 */
@Module({
  controllers: [ResumeController],
  providers: [ResumeService, PrismaService],
  exports: [ResumeService],
})
export class ResumeModule {}
