import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import { AdminService } from './admin.service';

@Controller('admin/interviews')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminInterviewsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listInterviews(@Query() query: AdminListQueryDto) {
    return this.adminService.listInterviews(query);
  }

  @Get(':id')
  async getInterviewById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getInterviewById(id);
  }
}
