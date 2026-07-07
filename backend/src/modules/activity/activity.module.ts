import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService, PrismaService, JwtAuthGuard],
  exports: [ActivityService],
})
export class ActivityModule {}
