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

@Controller('admin/companies')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminCompaniesController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listCompanies(@Query() query: AdminListQueryDto) {
    return this.adminService.listCompanies(query);
  }

  @Get(':id')
  async getCompanyById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCompanyById(id);
  }
}
