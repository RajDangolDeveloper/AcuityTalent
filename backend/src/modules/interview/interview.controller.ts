// src/modules/interview/interview.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { InterviewsService } from './interview.service';
import { CreateInterviewDto } from './dto/createInterview.dto';
import { UpdateInterviewDto } from './dto/updateInterview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewStatus } from '@prisma/client';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  async create(@Body() createInterviewDto: CreateInterviewDto, @Req() req) {
    return this.interviewsService.create(createInterviewDto);
  }

  @Get()
  async findAll() {
    return this.interviewsService.findAll();
  }

  @Get('candidate/month')
  async findByCandidateMonth(
    @Req() req,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const candidateId = req.user.id;

    if (!year || !month || isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      throw new BadRequestException(
        'year and month are required. Example: ?year=2024&month=5',
      );
    }

    return this.interviewsService.findByCandidateMonth(candidateId, y, m);
  }

  @Get('candidate')
  async findByCurrentCandidate(@Req() req) {
    return this.interviewsService.findByCurrentCandidateUserId(req.user.id);
  }

  @Get('candidate/:candidateId')
  async findByCandidate(
    @Param('candidateId', ParseIntPipe) candidateId: number,
  ) {
    return this.interviewsService.findByCandidate(candidateId);
  }

  @Get('room/:roomId')
  async findByRoomId(@Param('roomId') roomId: string) {
    return this.interviewsService.findByRoomId(roomId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.interviewsService.findOne(id);
  }

  @Patch(':id/complete')
  async markCompleted(
    @Param('id', ParseIntPipe) id: number,
    @Body('recordingUrl') recordingUrl?: string,
  ) {
    return this.interviewsService.markCompleted(id, recordingUrl);
  }

  @Patch(':id/status/completed')
  async markCompletedByStatusRoute(
    @Param('id', ParseIntPipe) id: number,
    @Body('recordingUrl') recordingUrl?: string,
  ) {
    return this.interviewsService.markCompleted(id, recordingUrl);
  }

  @Patch(':id/in-progress')
  async markInProgress(@Param('id', ParseIntPipe) id: number) {
    return this.interviewsService.markInProgress(id);
  }

  @Patch(':id/status/in-progress')
  async markInProgressByStatusRoute(@Param('id', ParseIntPipe) id: number) {
    return this.interviewsService.markInProgress(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: InterviewStatus,
  ) {
    return this.interviewsService.updateStatus(id, status);
  }

  @Patch(':id/notes')
  async updateNotes(
    @Param('id', ParseIntPipe) id: number,
    @Body('notes') notes: string,
  ) {
    return this.interviewsService.updateNotes(id, notes);
  }

  @Post('decision')
  async sendDecision(
    @Req() req,
    @Body('applicationId', ParseIntPipe) applicationId: number,
    @Body('decision') decision: 'OFFER' | 'REJECTED',
  ) {
    return this.interviewsService.sendDecision(
      applicationId,
      decision,
      req.user.id,
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    return this.interviewsService.update(id, updateInterviewDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.interviewsService.remove(id);
    return { message: 'Interview successfully deleted' };
  }
}
