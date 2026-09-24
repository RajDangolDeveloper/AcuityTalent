import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EducationService } from './education.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import {
  CandidateEducationResponseDto,
  RecruiterEducationResponseDto,
} from './entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('education')
@UseGuards(JwtAuthGuard)
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Post('/candidate')
  @HttpCode(HttpStatus.CREATED)
  async createCandidateEducation(
    @Body() createDto: CreateEducationDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: CandidateEducationResponseDto }> {
    const education = await this.educationService.createCandidateEducation(
      req.user.id,
      createDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      data: education,
    };
  }

  @Get('/candidate')
  async getCandidateEducations(
    @Req() req: any,
  ): Promise<{ statusCode: number; data: CandidateEducationResponseDto[] }> {
    const educations = await this.educationService.getCandidateEducationList(
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: educations,
    };
  }

  @Patch('candidate/:id')
  async updateCandidateEducation(
    @Param('id') id: string,
    @Body() updateDto: UpdateEducationDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: CandidateEducationResponseDto }> {
    const education = await this.educationService.updateCandidateEducation(
      req.user.id,
      parseInt(id),
      updateDto,
    );

    return {
      statusCode: HttpStatus.OK,
      data: education,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCandidateEducation(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    await this.educationService.deleteCandidateEducation(
      req.user.id,
      parseInt(id),
    );
  }

  @Post('/recruiter')
  @HttpCode(HttpStatus.CREATED)
  async createRecruiterEducation(
    @Body() createDto: CreateEducationDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: RecruiterEducationResponseDto }> {
    const education = await this.educationService.createRecruiterEducation(
      req.user.id,
      createDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      data: education,
    };
  }

  @Get('/recruiter')
  async getRecruiterEducations(
    @Req() req: any,
  ): Promise<{ statusCode: number; data: RecruiterEducationResponseDto[] }> {
    const educations = await this.educationService.getRecruiterEducationList(
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      data: educations,
    };
  }

  @Patch('recruiter/:id')
  async updateRecruiterEducation(
    @Param('id') id: string,
    @Body() updateDto: UpdateEducationDto,
    @Req() req: any,
  ): Promise<{ statusCode: number; data: RecruiterEducationResponseDto }> {
    const education = await this.educationService.updateRecruiterEducation(
      req.user.id,
      parseInt(id),
      updateDto,
    );

    return {
      statusCode: HttpStatus.OK,
      data: education,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRecruiterEducation(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    await this.educationService.deleteRecruiterEducation(
      req.user.id,
      parseInt(id),
    );
  }
}
