import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecruiterService } from './recruiter.service';
import { CreateRecruiterProfileDto } from './dto/CreateRecruiterProfile.dto';
import { UpdateRecruiterProfileDto } from './dto/UpdateRecruiterProfile.dto';
import { DeleteRecruiterProfileDto } from './dto/DeleteRecruiterProfile.dto';

@Controller('recruiters')
@UseGuards(JwtAuthGuard)
export class RecruiterController {
  constructor(private recruiterService: RecruiterService) {}

  @Get('profile')
  async GetRecruiterProfile(@Body() id: number) {
    return this.recruiterService.getRecruiterProfileById(id);
  }

  @Get('profile/current')
  async GetCurrentRecruiterProfile(@Req() req) {
    const userId = req.user.id;
    return this.recruiterService.getRecruiterProfileByUserId(userId);
  }

  @Post('profile')
  @HttpCode(HttpStatus.CREATED)
  async CreateRecruiterProfile(
    @Body() createRecruiterProfile: CreateRecruiterProfileDto,
  ) {
    return this.recruiterService.createRecruiterProfile(createRecruiterProfile);
  }

  @Patch('profile')
  async updateRecruiterProfile(
    @Req() req: any,
    @Body() updateData: UpdateRecruiterProfileDto,
  ) {
    const userId = req.user.id;
    return this.recruiterService.updateRecruiterProfile(userId, updateData);
  }

  @Delete('profile')
  async deleteRecruiterProfile(@Body() deleteData: DeleteRecruiterProfileDto) {
    return this.recruiterService.deleteRecruiterProfile(deleteData);
  }
}
