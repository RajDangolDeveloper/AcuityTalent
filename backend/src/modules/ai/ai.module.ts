import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PremiumGuard } from './guards/premium.guard';

@Module({
  imports: [HttpModule, UserModule, SubscriptionsModule],
  providers: [AiService, PremiumGuard],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
