import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';

import { AiService } from '../ai/ai.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [HttpModule, AiModule],
  controllers: [CandidateController],
  providers: [CandidateService, PrismaService],
  exports: [CandidateService],
})
export class CandidateModule {}
