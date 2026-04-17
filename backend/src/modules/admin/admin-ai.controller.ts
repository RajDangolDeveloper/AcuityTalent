import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import { AdminService } from './admin.service';

@Controller('admin/ai')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAiController {
  constructor(private readonly adminService: AdminService) {}

  @Get('embeddings')
  async listEmbeddings(@Query() query: AdminListQueryDto) {
    return this.adminService.listEmbeddings(query);
  }
}
