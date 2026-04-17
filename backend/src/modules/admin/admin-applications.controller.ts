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

@Controller('admin/applications')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminApplicationsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listApplications(@Query() query: AdminListQueryDto) {
    return this.adminService.listApplications(query);
  }

  @Get(':id')
  async getApplicationById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getApplicationById(id);
  }
}
