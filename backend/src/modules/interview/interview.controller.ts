
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
  ForbiddenException,
} from '@nestjs/common';
import { InterviewsService } from './interview.service';
import { CreateInterviewDto } from './dto/createInterview.dto';
import { UpdateInterviewDto } from './dto/updateInterview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewStatus } from '@prisma/client';
import { RecruiterService } from '../recruiters/recruiter.service';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class InterviewsController {
  constructor(
    private readonly interviewsService: InterviewsService,
    private readonly recruiterService: RecruiterService,
  ) {}

  @Post()
  async create(@Body() createInterviewDto: CreateInterviewDto, @Req() req) {
    if (req.user.role !== 'ADMIN') {
      const recruiter = await this.recruiterService.getRecruiterProfileByUserId(
        req.user.id,
      );

      if (!recruiter || recruiter.id !== createInterviewDto.interviewerId) {
        throw new ForbiddenException(
          'You are not authorized to create interviews for this recruiter',
        );
      }
    }

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
    @Req() req,
    @Body('recordingUrl') recordingUrl?: string,
  ) {
    await this.interviewsService.assertInterviewWriteAccess(
      id,
      req.user.id,
      req.user.role,
    );
    return this.interviewsService.markCompleted(id, recordingUrl);
  }

  @Patch(':id/status/completed')
  async markCompletedByStatusRoute(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body('recordingUrl') recordingUrl?: string,
  ) {
    await this.interviewsService.assertInterviewWriteAccess(
      id,
      req.user.id,
      req.user.role,
    );
    return this.interviewsService.markCompleted(id, recordingUrl);
  }

  @Patch(':id/in-progress')
  async markInProgress(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.interviewsService.assertInterviewWriteAccess(
      id,
      req.user.id,
      req.user.role,
    );
    return this.interviewsService.markInProgress(id);
  }

  @Patch(':id/status/in-progress')
  async markInProgressByStatusRoute(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    await this.interviewsService.assertInterviewWriteAccess(
      id,
      req.user.id,
      req.user.role,
    );
    return this.interviewsService.markInProgress(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body('status') status: InterviewStatus,
  ) {
    await this.interviewsService.assertInterviewWriteAccess(
      id,
      req.user.id,
      req.user.role,
    );
    return this.interviewsService.updateStatus(id, status);
  }

  @Patch(':id/notes')
  async updateNotes(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body('notes') notes: string,
  ) {
    await this.interviewsService.assertInterviewWriteAccess(
      id,
      req.user.id,
      req.user.role,
    );
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
    @Req() req,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    await this.interviewsService.assertInterviewWriteAccess(
      id,
      req.user.id,
      req.user.role,
    );
    return this.interviewsService.update(id, updateInterviewDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.interviewsService.assertInterviewWriteAccess(
      id,
      req.user.id,
      req.user.role,
    );
    await this.interviewsService.remove(id);
    return { message: 'Interview successfully deleted' };
  }
}
