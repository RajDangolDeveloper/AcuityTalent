import { Module } from '@nestjs/common';
import { InterviewParticipantController } from './participant.controller';
import { InterviewParticipantService } from './participant.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [InterviewParticipantController],
  providers: [InterviewParticipantService, PrismaService],
  exports: [InterviewParticipantService],
})
export class InterviewParticipantModule {}
