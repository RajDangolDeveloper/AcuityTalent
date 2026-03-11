import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeResponseDto } from './dto/resume-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createResume(
    @Body() createResumeDto: CreateResumeDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ResumeResponseDto }> {
    const resume = await this.resumeService.createResume(
      createResumeDto,
      req.user.id,
    );

    return {
      statusCode: HttpStatus.CREATED,
      data: resume,
    };
  }

  @Get()
  async getResumes(@Req() req: any): Promise<{
    statusCode: number;
    data: ResumeResponseDto[];
    count: number;
  }> {
    const resumes = await this.resumeService.getResumesByCandidate(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      data: resumes,
      count: resumes.length,
    };
  }

  @Get(':id')
  async getResume(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ResumeResponseDto }> {
    const resume = await this.resumeService.getResumeById(
      parseInt(id),
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: resume,
    };
  }

  @Get(':id/download')
  async downloadResume(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{
    statusCode: number;
    data: { filePath: string; fileName: string; fileType: string };
  }> {
    const resumeData = await this.resumeService.downloadResume(
      parseInt(id),
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: resumeData,
    };
  }

  @Patch(':id')
  async updateResume(
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ResumeResponseDto }> {
    const resume = await this.resumeService.updateResume(
      parseInt(id),
      updateResumeDto,
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: resume,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResume(@Param('id') id: string, @Req() req: any): Promise<void> {
    await this.resumeService.deleteResume(parseInt(id), req.user.id);
  }
}
