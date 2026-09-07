import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InterviewRequestService } from './interviewRequests.service';
import { InterviewRequestController } from './interviewRequests.controller';
import { CandidateModule } from '../candidates/candidate.module';
import { RecruiterModule } from '../recruiters/recruiter.module';
import { JobModule } from '../jobs/job.module';
import { ApplicationModule } from '../applications/applications.module';
import { InterviewsModule } from '../interview/interview.module';

@Module({
  imports: [
    JobModule,
    CandidateModule,
    RecruiterModule,
    ApplicationModule,
    InterviewsModule,
  ],
  controllers: [InterviewRequestController],
  providers: [InterviewRequestService, PrismaService],
  exports: [InterviewRequestService],
})
export class InterviewRequestModule {}
