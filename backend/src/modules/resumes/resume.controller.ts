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

/**
 * ResumeController - RESTful API endpoints for resume management
 * Handles all resume-related HTTP requests
 * Maps to sequence diagram steps 1-4
 */
@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  /**
   * POST /resumes
   * Step 2: Candidate creates resume & fills up details
   * Uploads resume file and stores metadata
   */
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

  /**
   * GET /resumes
   * Step 1, 3: Candidate logs in & selects "Resumes"
   * Step 3: Candidate sees resume list and preview
   * Retrieves all resumes for the candidate
   */
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

  /**
   * GET /resumes/:id
   * Step 3: Candidate previews a resume
   * Get single resume details
   */
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

  /**
   * GET /resumes/:id/download
   * Step 4: Candidate selects options (export pdf)
   * Returns resume file details for download
   */
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

  /**
   * PATCH /resumes/:id
   * Update resume metadata
   */
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

  /**
   * DELETE /resumes/:id
   * Delete a resume
   * Cannot delete if used in active applications
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResume(@Param('id') id: string, @Req() req: any): Promise<void> {
    await this.resumeService.deleteResume(parseInt(id), req.user.id);
  }
}
