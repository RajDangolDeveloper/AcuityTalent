import { Module } from '@nestjs/common';
import { SavedJobController } from './saved-job.controller';
import { SavedJobService } from './saved-job.service';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * SavedJobModule - Encapsulates all saved jobs management functionality
 * Dependencies: Prisma (database)
 */
@Module({
  controllers: [SavedJobController],
  providers: [SavedJobService, PrismaService],
  exports: [SavedJobService],
})
export class SavedJobModule {}
