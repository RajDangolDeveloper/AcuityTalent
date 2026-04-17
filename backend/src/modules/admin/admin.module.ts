import { Module } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminAiController } from './admin-ai.controller';
import { AdminApplicationsController } from './admin-applications.controller';
import { AdminCandidatesController } from './admin-candidates.controller';
import { AdminCompaniesController } from './admin-companies.controller';
import { AdminInterviewsController } from './admin-interviews.controller';
import { AdminJobsController } from './admin-jobs.controller';
import { AdminOverviewController } from './admin-overview.controller';
import { AdminRecruitersController } from './admin-recruiters.controller';
import { AdminResumesController } from './admin-resumes.controller';
import { AdminSavedJobsController } from './admin-saved-jobs.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [
    AdminOverviewController,
    AdminUsersController,
    AdminCandidatesController,
    AdminRecruitersController,
    AdminCompaniesController,
    AdminJobsController,
    AdminApplicationsController,
    AdminInterviewsController,
    AdminResumesController,
    AdminSavedJobsController,
    AdminAiController,
  ],
  providers: [AdminService, PrismaService, AdminGuard],
  exports: [AdminService],
})
export class AdminModule {}
