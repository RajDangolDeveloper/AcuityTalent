import { Module } from '@nestjs/common';
import { ApplicationController } from './applications.controller';
import { ApplicationService } from './applications.service';
import { AiService } from '../ai/ai.service';
import { AiModule } from '../ai/ai.module';
import { HttpModule } from '@nestjs/axios';
import { CandidateService } from '../candidates/candidate.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../config/email.service';

@Module({
  imports: [HttpModule],
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    CandidateService,
    PrismaService,
    EmailService,
    AiService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
