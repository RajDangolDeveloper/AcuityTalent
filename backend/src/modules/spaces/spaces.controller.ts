import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('spaces')
export class SpacesController {
  constructor(private spacesService: SpacesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-url')
  async generateUploadUrl(@Body() body: GenerateUploadUrlDto) {
    const { fileName, contentType } = body;
    const result = await this.spacesService.generateUploadUrl(
      fileName,
      contentType,
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-url')
  async generateGetUrl(@Query('key') key: string) {
    return { url: await this.spacesService.generateGetUrl(key) };
  }
}
