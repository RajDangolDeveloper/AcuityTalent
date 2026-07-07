import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InterviewRequestService } from './interviewRequests.service';
import { InterviewRequestController } from './interviewRequests.controller';
import { CandidateModule } from '../candidates/candidate.module';
import { RecruiterModule } from '../recruiters/recruiter.module';
import { JobModule } from '../jobs/job.module';

@Module({
  imports: [JobModule, CandidateModule, RecruiterModule],
  controllers: [InterviewRequestController],
  providers: [InterviewRequestService, PrismaService],
  exports: [InterviewRequestService],
})
export class InterviewRequestModule {}
