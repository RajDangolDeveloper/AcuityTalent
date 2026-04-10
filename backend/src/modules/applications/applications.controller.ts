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
import { GetApplicationsQueryDto } from './dto/get-applications-query.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Get('candidate/recentApplications')
  async getRecentApplicationsForUser(@Req() req: any) {
    return this.applicationService.getRecentJobApplications(req.user.id);
  }

  @Get('candidate/responserate')
  async getResponseRateForUser(@Req() req: any) {
    const userId = req.user.id;
    const responseRate = await this.applicationService.getResponseRate(userId);
    return responseRate;
  }

  @Get('candidate/totalApplications')
  async getTotalApplicationsForUser(@Req() req: any) {
    const userId = req.user.id;
    const totalApplications =
      await this.applicationService.getUserTotalApplications(userId);
    return totalApplications;
  }

  @Get('candidate/interviewrate')
  async getInterviewRate(@Req() req: any) {
    const userId = req.user.id;
    const interviewRate =
      await this.applicationService.getInterviewRate(userId);
    return interviewRate;
  }

  @Get('candidate/totaloffers')
  async getOfferNumber(@Req() req: any) {
    const userId = req.user.id;
    const offerNumber = await this.applicationService.getNumberOfOffers(userId);
    return offerNumber;
  }

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

  @Get(':id')
  async getApplicationById(
    @Param('id') id: string,
  ): Promise<{ statusCode: number; data: ApplicationResponseDto }> {
    const application = await this.applicationService.getApplicationById(
      parseInt(id),
    );

    return {
      statusCode: HttpStatus.OK,
      data: application,
    };
  }

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
