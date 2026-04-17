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

@Controller('admin/resumes')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminResumesController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listResumes(@Query() query: AdminListQueryDto) {
    return this.adminService.listResumes(query);
  }

  @Get(':id')
  async getResumeById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getResumeById(id);
  }
}
