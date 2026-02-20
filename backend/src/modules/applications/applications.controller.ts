import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApplicationService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { GetApplicationsQueryDto } from './dto/get-applications-query.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * ApplicationController - RESTful API endpoints for job applications
 * Handles all application-related HTTP requests
 * Maps to sequence diagram flows
 */
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  /**
   * POST /applications
   * Step 11: Candidate submits job application
   * Creates a new application with resume and optional cover letter
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ApplicationResponseDto }> {
    const application = await this.applicationService.createApplication(
      createApplicationDto,
      req.user.id,
    );

    return {
      statusCode: HttpStatus.CREATED,
      data: application,
    };
  }

  /**
   * GET /applications/recruiter/all
   * Steps 13-14: Recruiter views all applications for their jobs
   * Supports filtering by status, job, pagination
   */
  @Get('recruiter/all')
  async getApplicationsForRecruiter(
    @Query() query: GetApplicationsQueryDto,
    @Req() req: any,
  ): Promise<{
    statusCode: number;
    data: ApplicationResponseDto[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const { data, total } =
      await this.applicationService.getApplicationsForRecruiter(
        req.user.id,
        query,
      );

    return {
      statusCode: HttpStatus.OK,
      data,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
      },
    };
  }

  /**
   * GET /applications/candidate/all
   * Steps 8-12: Candidate views their applications
   * Shows application status and job details
   */
  @Get('candidate/all')
  async getApplicationsForCandidate(
    @Query() query: GetApplicationsQueryDto,
    @Req() req: any,
  ): Promise<{
    statusCode: number;
    data: ApplicationResponseDto[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const { data, total } =
      await this.applicationService.getApplicationsForCandidate(
        req.user.id,
        query,
      );

    return {
      statusCode: HttpStatus.OK,
      data,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
      },
    };
  }

  /**
   * GET /applications/stats/dashboard
   * Recruiter dashboard statistics
   * Shows count of applications by status
   */
  @Get('stats/dashboard')
  async getApplicationStats(
    @Req() req: any,
  ): Promise<{ statusCode: number; data: any }> {
    const stats = await this.applicationService.getApplicationStats(
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: stats,
    };
  }

  /**
   * GET /applications/job/:jobId/candidates
   * Recruiter views all candidates for a specific job
   * Steps 13-14: Logs in & views candidate list
   */
  @Get('job/:jobId/candidates')
  async getCandidatesForJob(
    @Param('jobId') jobId: string,
    @Query() query: GetApplicationsQueryDto,
    @Req() req: any,
  ): Promise<{
    statusCode: number;
    data: ApplicationResponseDto[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const { data, total } = await this.applicationService.getCandidatesForJob(
      parseInt(jobId),
      req.user.id,
      query,
    );

    return {
      statusCode: HttpStatus.OK,
      data,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
      },
    };
  }

  /**
   * GET /applications/:id
   * Get single application details
   * Both recruiter and candidate can view their own applications
   */
  @Get(':id')
  async getApplicationById(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ApplicationResponseDto }> {
    const application = await this.applicationService.getApplicationById(
      parseInt(id),
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: application,
    };
  }

  /**
   * PATCH /applications/:id/shortlist
   * Step 16: Recruiter shortlists candidate
   * Moves candidate to shortlist and sends email notification
   */
  @Patch(':id/shortlist')
  async shortlistApplication(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ApplicationResponseDto }> {
    const application = await this.applicationService.shortlistApplication(
      parseInt(id),
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: application,
    };
  }

  /**
   * PATCH /applications/:id/interview
   * Steps 20-21: Begin interview process
   * Recruiter moves candidate to interviewing stage
   */
  @Patch(':id/interview')
  async updateToInterviewing(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ApplicationResponseDto }> {
    const application = await this.applicationService.updateToInterviewing(
      parseInt(id),
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: application,
    };
  }

  /**
   * PATCH /applications/:id/accept
   * Steps 22-23: Recruiter extends offer
   * Sends offer email to candidate
   */
  @Patch(':id/accept')
  async acceptApplication(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ApplicationResponseDto }> {
    const application = await this.applicationService.acceptApplication(
      parseInt(id),
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: application,
    };
  }

  /**
   * PATCH /applications/:id/offer
   * Alias endpoint for extending offer (same as /accept)
   * Supports frontend naming convention
   */
  @Patch(':id/offer')
  async extendOffer(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ApplicationResponseDto }> {
    const application = await this.applicationService.acceptApplication(
      parseInt(id),
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: application,
    };
  }

  /**
   * PATCH /applications/:id/reject
   * Steps 25-26, 28-30: Reject candidate
   * Can be during any phase, sends rejection email
   */
  @Patch(':id/reject')
  async rejectApplication(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ApplicationResponseDto }> {
    const application = await this.applicationService.rejectApplication(
      parseInt(id),
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: application,
    };
  }

  /**
   * PATCH /applications/:id/accept-offer
   * Candidate accepts offer from recruiter
   * Final step in successful hiring process
   */
  @Patch(':id/accept-offer')
  async acceptOffer(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ApplicationResponseDto }> {
    const application = await this.applicationService.acceptOffer(
      parseInt(id),
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: application,
    };
  }

  /**
   * PATCH /applications/:id/withdraw
   * Candidate withdraws application
   * Can only withdraw before accepting offer
   */
  @Patch(':id/withdraw')
  async withdrawApplication(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: ApplicationResponseDto }> {
    const application = await this.applicationService.withdrawApplication(
      parseInt(id),
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: application,
    };
  }
}
