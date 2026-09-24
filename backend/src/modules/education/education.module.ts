import { Module } from '@nestjs/common';
import { EducationService } from './education.service';
import { EducationController } from './education.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { CandidateModule } from '../candidates/candidate.module';

@Module({
  imports: [CandidateModule],
  controllers: [EducationController],
  providers: [EducationService, PrismaService],
})
export class EducationModule {}
