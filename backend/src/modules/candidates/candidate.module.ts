import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';

import { AiService } from '../ai/ai.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [CandidateController],
  providers: [CandidateService, PrismaService, AiService],
  exports: [CandidateService],
})
export class CandidateModule {}
