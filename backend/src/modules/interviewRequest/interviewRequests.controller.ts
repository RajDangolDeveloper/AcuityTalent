import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewRequestService } from './interviewRequests.service';
import { createInterviewRequestDto } from './dto/createInterviewRequest.dto';

@Controller('interviewRequest')
@UseGuards(JwtAuthGuard)
export class InterviewRequestController {
  constructor(
    private readonly interviewRequestService: InterviewRequestService,
  ) {}

  @Get()
  async getInterviewRequest(@Query('id') id: number) {
    return this.interviewRequestService.getInterviewRequest(id);
  }

  @Get('recruiter')
  async getInterviewRequestByRecruiter(@Req() req) {
    return this.interviewRequestService.getInterviewRequestsByRecruiter(
      req.user.id,
    );
  }

  @Get('candidate')
  async getInterviewRequestsByCandidate(@Req() req) {
    return this.interviewRequestService.getInterviewRequestsByCandidate(
      req.user.id,
    );
  }

  @Post()
  async createInterviewRequest(dto: createInterviewRequestDto) {
    return this.interviewRequestService.createInterviewRequest(dto);
  }
}
