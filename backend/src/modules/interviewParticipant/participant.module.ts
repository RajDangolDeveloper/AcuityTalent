import { Module } from '@nestjs/common';
import { InterviewParticipantController } from './participant.controller';
import { InterviewParticipantService } from './participant.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [InterviewParticipantController],
  providers: [InterviewParticipantService, PrismaService],
  exports: [InterviewParticipantService],
})
export class InterviewParticipantModule {}
