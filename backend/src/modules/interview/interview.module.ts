import { Module } from '@nestjs/common';
import { InterviewsService } from './interview.service';
import { InterviewGateway } from './interview.gateway';
import { InterviewsController } from './interview.controller';
import { RecruiterModule } from '../recruiters/recruiter.module';
import { CandidateModule } from '../candidates/candidate.module';
import { ApplicationModule } from '../applications/applications.module';
import { EmailService } from '../../config/email.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [RecruiterModule, CandidateModule, ApplicationModule],
  controllers: [InterviewsController],
  providers: [InterviewsService, InterviewGateway, PrismaService, EmailService],
  exports: [InterviewsService],
})
export class InterviewsModule {}
