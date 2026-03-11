import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * CompanyModule - Encapsulates all company management functionality
 * Dependencies: Prisma (database)
 */
@Module({
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService],
  exports: [CompanyService],
})
export class CompanyModule {}