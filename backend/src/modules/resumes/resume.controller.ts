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
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeResponseDto } from './dto/resume-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpacesService } from '../spaces/spaces.service';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(
    private resumeService: ResumeService,
    private spacesService: SpacesService,
  ) {}

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
  ): Promise<{ statusCode: number; downloadUrl: string; fileName: string }> {
    const resumeData = await this.resumeService.downloadResume(
      parseInt(id),
      req.user.id,
    );
    const downloadUrl = await this.spacesService.generateGetUrl(
      resumeData.filePath,
      3600,
    );
    return {
      statusCode: HttpStatus.OK,
      downloadUrl,
      fileName: resumeData.fileName,
    };
  }

  @Get(':id/view')
  async viewResume(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ statusCode: number; viewUrl: string; fileName: string }> {
    const resumeData = await this.resumeService.downloadResume(
      parseInt(id),
      req.user.id,
    );
    const viewUrl = await this.spacesService.generateGetUrl(
      resumeData.filePath,
      3600,
    );
    return {
      statusCode: HttpStatus.OK,
      viewUrl,
      fileName: resumeData.fileName,
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

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only PDF, DOC, or DOCX files are allowed'),
            false,
          );
        }
      },
    }),
  )
  async uploadLocal(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Body('textContent') textContent: string,
    @Body('resumeText') resumeText: string,
  ) {
    const userId = req.user.id;
    if (!file) throw new BadRequestException('No file uploaded');
    if (!userId) throw new BadRequestException('userId is required');
    if (isNaN(userId)) throw new BadRequestException('userId must be a number');
    return this.resumeService.createFromLocalFile(
      file,
      userId,
      textContent,
      resumeText,
    );
  }
}
