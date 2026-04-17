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

@Controller('admin/recruiters')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminRecruitersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listRecruiters(@Query() query: AdminListQueryDto) {
    return this.adminService.listRecruiters(query);
  }

  @Get(':id')
  async getRecruiterById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getRecruiterById(id);
  }
}
