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
import { diskStorage } from 'multer';
import { ResumeResponseDto } from './dto/resume-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

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

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
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
    @Body('userId') userIdStr: string,
    @Body('textContent') textContent: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!userIdStr) throw new BadRequestException('userId is required');
    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) throw new BadRequestException('userId must be a number');
    return this.resumeService.createFromLocalFile(file, userId, textContent);
  }
}
