import { Module } from '@nestjs/common';
import { InterviewsController } from './interview.controller';
import { InterviewsService } from './interview.service';
import { InterviewGateway } from './interview.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [InterviewsController],
  providers: [InterviewsService, InterviewGateway, PrismaService],
  exports: [InterviewsService],
})
export class InterviewsModule {}
