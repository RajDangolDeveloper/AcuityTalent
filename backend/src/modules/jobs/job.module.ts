import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * JobModule - Encapsulates all job management functionality
 * Dependencies: Prisma (database)
 */
@Module({
  controllers: [JobController],
  providers: [JobService, PrismaService],
  exports: [JobService],
})
export class JobModule {}
