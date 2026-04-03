import { Module } from '@nestjs/common';
import { ApplicationController } from './applications.controller';
import { ApplicationService } from './applications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/config/email.service';
import { AiService } from '../ai/ai.service';
import { AiModule } from '../ai/ai.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService, EmailService, AiService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
