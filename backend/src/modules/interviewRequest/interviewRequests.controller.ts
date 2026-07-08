import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewRequestService } from './interviewRequests.service';
import { createInterviewRequestDto } from './dto/createInterviewRequest.dto';
import { updateInterviewRequestDto } from './dto/updateInterviewRequest.dto';

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
  async createInterviewRequest(@Body() dto: createInterviewRequestDto) {
    return this.interviewRequestService.createInterviewRequest(dto);
  }

  @Patch()
  async updateInterviewRequest(@Body() dto: updateInterviewRequestDto) {
    return this.interviewRequestService.updateInterviewRequest(dto);
  }

  @Delete()
  async deleteInterviewRequest(@Query('id') id: number) {
    return this.interviewRequestService.deleteInterviewRequest(id);
  }
}
