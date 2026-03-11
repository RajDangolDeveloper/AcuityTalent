import { Module } from '@nestjs/common';
import { ApplicationController } from './applications.controller';
import { ApplicationService } from './applications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/config/email.service';

/**
 * ApplicationModule - Encapsulates all application-related functionality
 * Dependencies: Prisma (database), Email (notifications)
 */
@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService, EmailService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
