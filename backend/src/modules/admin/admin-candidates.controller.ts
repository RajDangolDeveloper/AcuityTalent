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

@Controller('admin/candidates')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminCandidatesController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listCandidates(@Query() query: AdminListQueryDto) {
    return this.adminService.listCandidates(query);
  }

  @Get(':id')
  async getCandidateById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCandidateById(id);
  }
}
