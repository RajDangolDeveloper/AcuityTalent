import { Module } from '@nestjs/common';
import { EntitlementsService } from './entitlements.service';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EntitlementsService, SubscriptionsService, PrismaService],
  controllers: [SubscriptionsController],
  exports: [EntitlementsService, SubscriptionsService],
})
export class SubscriptionsModule {}
