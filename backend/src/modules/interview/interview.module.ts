import { Module } from '@nestjs/common';
import { InterviewsController } from './interview.controller';
import { InterviewGateway } from './interview.gateway';
import { InterviewsService } from './interview.service';

@Module({
  controllers: [InterviewsController],
  providers: [InterviewsService, InterviewGateway],
  exports: [InterviewsService],
})
export class InterviewsModule {}
