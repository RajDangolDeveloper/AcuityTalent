import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin/overview')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminOverviewController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async getOverview() {
    return this.adminService.getOverview();
  }
}
