import { Module } from '@nestjs/common';
import { WorkExperienceService } from './work-experience.service';
import { WorkExperienceController } from './work-experience.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { CandidateModule } from '../candidates/candidate.module';
import { HttpModule } from '@nestjs/axios';
import { RecruiterModule } from '../recruiters/recruiter.module';

@Module({
  imports: [HttpModule, CandidateModule, RecruiterModule],
  controllers: [WorkExperienceController],
  providers: [WorkExperienceService, PrismaService],
})
export class WorkExperienceModule {}
