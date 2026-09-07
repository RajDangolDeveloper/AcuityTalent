import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('spaces')
export class SpacesController {
  constructor(private spacesService: SpacesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('upload-url')
  async generateViewUrl(
    @Query('fileName') fileName: string,
    @Query('isPrivate') isPrivate: boolean,
  ) {
    const result = await this.spacesService.generateViewUrl(
      fileName,
      isPrivate,
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-file/public')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPublicFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileDto,
  ) {
    const result = await this.spacesService.uploadPublicFile(file, body);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-file/private')
  async uploadPrivateFile(@Body() body: UploadFileDto) {}

  @UseGuards(JwtAuthGuard)
  @Get('get-url')
  async generateGetUrl(@Query('key') key: string, isPrivate: boolean) {
    return { url: await this.spacesService.generateGetUrl(key, isPrivate) };
  }
}
