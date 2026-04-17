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

@Controller('admin/jobs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminJobsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listJobs(@Query() query: AdminListQueryDto) {
    return this.adminService.listJobs(query);
  }

  @Get(':id')
  async getJobById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getJobById(id);
  }
}
