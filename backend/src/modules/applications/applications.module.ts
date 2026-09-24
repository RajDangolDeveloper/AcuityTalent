import { Module } from '@nestjs/common';
import { ApplicationController } from './applications.controller';
import { ApplicationService } from './applications.service';
import { AiModule } from '../ai/ai.module';
import { HttpModule } from '@nestjs/axios';
import { CandidateModule } from '../candidates/candidate.module';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../config/email.service';
import { ActivityModule } from '../activity/activity.module';
import { JobModule } from '../jobs/job.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    HttpModule,
    AiModule,
    CandidateModule,
    ActivityModule,
    JobModule,
    SubscriptionsModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService, EmailService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
