import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { PublicJobController } from './public-job.controller';
import { JobService } from './job.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AiModule } from '../ai/ai.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [AiModule, SubscriptionsModule],
  controllers: [JobController, PublicJobController],
  providers: [JobService, PrismaService],
  exports: [JobService],
})
export class JobModule {}
