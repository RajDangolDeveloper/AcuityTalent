import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * CandidateModule - Encapsulates all candidate management functionality
 * Dependencies: Prisma (database)
 */
@Module({
  controllers: [CandidateController],
  providers: [CandidateService, PrismaService],
  exports: [CandidateService],
})
export class CandidateModule {}
