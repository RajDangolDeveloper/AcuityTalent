import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInterviewDto } from './dto/createInterview.dto';
import { UpdateInterviewDto } from './dto/updateInterview.dto';
import { InterviewsService } from './interview.service';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  create(@Body() createInterviewDto: CreateInterviewDto) {
    return this.interviewsService.create(createInterviewDto);
  }

  @Get()
  findAll() {
    return this.interviewsService.findAll();
  }

  @Get('candidate')
  findByCandidate(@Req() req: any, @Query('month') monthStr?: string) {
    const candidateId = req.user.candidateId;

    if (monthStr) {
      const [year, month] = monthStr.split('-').map(Number);
      return this.interviewsService.findByCandidateMonth(
        candidateId,
        year,
        month,
      );
    }
    return this.interviewsService.findByCandidate(candidateId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(+id);
  }

  @Get('room/:roomId')
  findByRoomId(@Param('roomId') roomId: string) {
    return this.interviewsService.findByRoomId(roomId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    return this.interviewsService.update(+id, updateInterviewDto);
  }

  @Patch(':id/status/in-progress')
  markInProgress(@Param('id') id: string) {
    return this.interviewsService.markInProgress(+id);
  }

  @Patch(':id/status/completed')
  markCompleted(
    @Param('id') id: string,
    @Body('recordingUrl') recordingUrl?: string,
  ) {
    return this.interviewsService.markCompleted(+id, recordingUrl);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interviewsService.remove(+id);
  }
}
