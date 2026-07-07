import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('user')
  async getActivityByUserId(@Req() req) {
    return this.activityService.getLatestUserActivity(req.user.id);
  }

  @Get('user/:id')
  async getActivityPageByUserId(
    @Param('id') id: number,
    @Query('page') page: number,
  ) {
    return this.activityService.getUserActivity(id, page);
  }

  @Delete(':id')
  async deleteActivityById(@Param('id') id: number) {
    return this.activityService.deleteActivity(id);
  }

  @Post()
  async createActivity(@Body() dto: CreateActivityDto) {
    return this.activityService.createUserActivity(dto);
  }
}
