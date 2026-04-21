import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  transactionRef!: string;

  @Type(() => Number)
  @IsNumber()
  userId!: number;

  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsIn(['PREMIUM', 'NON_PREMIUM'])
  planType!: 'PREMIUM' | 'NON_PREMIUM';

  @IsOptional()
  @IsString()
  signature?: string;

  @IsOptional()
  @IsString()
  signed_field_names?: string;

  @IsOptional()
  @IsString()
  total_amount?: string;

  @IsOptional()
  @IsString()
  transaction_uuid?: string;

  @IsOptional()
  @IsString()
  product_code?: string;

  @IsOptional()
  @IsString()
  transaction_code?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpgradeSubscriptionDto {
  @IsIn(['PREMIUM'])
  planType!: 'PREMIUM';

  @IsOptional()
  @IsIn(['ANNUAL', 'MONTHLY'])
  billingCycle?: 'ANNUAL' | 'MONTHLY';

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  failureUrl?: string;
}

export class PaymentFailureDto {
  @IsString()
  @IsNotEmpty()
  transactionRef!: string;

  @Type(() => Number)
  @IsNumber()
  userId!: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsIn(['PREMIUM', 'NON_PREMIUM'])
  planType!: 'PREMIUM' | 'NON_PREMIUM';
}

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMySubscription(@Req() req: any): Promise<any> {
    const userId = req.user.id;
    return this.subscriptionsService.getUserSubscriptionStatus(userId);
  }

  @Get('me/payments')
  @UseGuards(JwtAuthGuard)
  async getMyPaymentHistory(@Req() req: any) {
    return this.subscriptionsService.getUserPaymentHistory(Number(req.user.id));
  }

  @Get('payment-status/:transactionRef')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(
    @Req() req: any,
    @Param('transactionRef') transactionRef: string,
  ) {
    return this.subscriptionsService.getPaymentStatusByTransactionRef(
      Number(req.user.id),
      transactionRef,
    );
  }

  @Post('upgrade-to-premium')
  @UseGuards(JwtAuthGuard)
  async upgradeSubscription(
    @Req() req: any,
    @Body() dto: UpgradeSubscriptionDto,
  ): Promise<{
    success: boolean;
    message: string;
    paymentReference?: string;
    paymentUrl?: string;
    amount?: number;
    formData?: Record<string, string>;
  }> {
    const userId = Number(req.user.id);

    if (dto.planType !== 'PREMIUM') {
      throw new BadRequestException(
        'Only PREMIUM plan is available for upgrade',
      );
    }

    const payment = await this.subscriptionsService.initiateEsewaUpgrade(
      userId,
      dto.billingCycle ?? 'ANNUAL',
      {
        successUrl: dto.successUrl,
        failureUrl: dto.failureUrl,
      },
    );

    return {
      success: true,
      message: 'eSewa payment initiated',
      paymentReference: payment.transactionRef,
      paymentUrl: payment.paymentUrl,
      amount: payment.amount,
      formData: payment.formData,
    };
  }

  @Post('webhook/payment-failed')
  async handlePaymentFailure(
    @Body() webhook: PaymentFailureDto,
  ): Promise<{ success: boolean; message: string }> {
    if (!webhook.transactionRef || !webhook.userId) {
      throw new BadRequestException('Missing transactionRef or userId');
    }

    try {
      await this.subscriptionsService.processPaymentFailure(webhook);
      return {
        success: true,
        message: 'Payment marked as failed',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('webhook/payment-success')
  async handlePaymentSuccess(
    @Body() webhook: PaymentWebhookDto,
  ): Promise<{ success: boolean; message: string }> {
    if (!webhook.transactionRef || !webhook.userId) {
      throw new BadRequestException('Missing transactionRef or userId');
    }

    if (webhook.provider === 'ESEWA') {
      if (
        !webhook.signature ||
        !webhook.signed_field_names ||
        !webhook.total_amount ||
        !webhook.transaction_uuid ||
        !webhook.product_code
      ) {
        throw new BadRequestException('Missing eSewa webhook signature fields');
      }

      const isValid = this.subscriptionsService.verifyEsewaWebhookSignature({
        signature: webhook.signature,
        signedFieldNames: webhook.signed_field_names,
        fields: {
          transaction_code: webhook.transaction_code,
          status: webhook.status,
          total_amount: webhook.total_amount,
          transaction_uuid: webhook.transaction_uuid,
          product_code: webhook.product_code,
          signed_field_names: webhook.signed_field_names,
        },
      });

      if (!isValid || webhook.transaction_uuid !== webhook.transactionRef) {
        throw new BadRequestException('Invalid eSewa webhook signature');
      }
    }

    try {
      await this.subscriptionsService.processPaymentSuccess(webhook);
      return {
        success: true,
        message: 'Subscription renewed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('test/payment-success')
  async testPaymentSuccess(
    @Body() webhook: PaymentWebhookDto,
  ): Promise<{ success: boolean; message: string }> {
    if (!webhook.transactionRef || !webhook.userId) {
      throw new BadRequestException('Missing transactionRef or userId');
    }

    try {
      await this.subscriptionsService.processPaymentSuccess(webhook);
      return {
        success: true,
        message: 'Subscription renewed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
