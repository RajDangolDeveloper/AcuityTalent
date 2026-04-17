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

@Controller('admin/saved-jobs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminSavedJobsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listSavedJobs(@Query() query: AdminListQueryDto) {
    return this.adminService.listSavedJobs(query);
  }

  @Get(':id')
  async getSavedJobById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getSavedJobById(id);
  }
}
