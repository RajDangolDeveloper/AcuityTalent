import { Module } from '@nestjs/common';
import { SavedJobController } from './saved-job.controller';
import { SavedJobService } from './saved-job.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SavedJobController],
  providers: [SavedJobService, PrismaService],
  exports: [SavedJobService],
})
export class SavedJobModule {}
