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

/**
 * DTO for payment webhook (called after payment succeeds externally)
 */
export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  transactionRef: string;

  @Type(() => Number)
  @IsNumber()
  userId: number;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsIn(['PREMIUM', 'NON_PREMIUM'])
  planType: 'PREMIUM' | 'NON_PREMIUM'; // Plan purchased

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
}

/**
 * DTO for requesting a subscription upgrade
 */
export class UpgradeSubscriptionDto {
  @IsIn(['PREMIUM'])
  planType: 'PREMIUM';

  @IsOptional()
  @IsIn(['ANNUAL', 'MONTHLY'])
  billingCycle?: 'ANNUAL' | 'MONTHLY'; // For future extensibility; currently annual only
}

/**
 * Subscriptions controller handles premium upgrades and payment webhooks.
 */
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * GET current user's subscription status
   * Accessible only to authenticated users
   */
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

  /**
   * POST request to upgrade subscription
   * In a real scenario, this would initiate a payment flow with a provider like Stripe.
   * For now, it returns a payment link or reference that the frontend can use.
   *
   * In production:
   * 1. Frontend calls this endpoint
   * 2. Backend creates a payment intent with Stripe/similar
   * 3. Frontend redirects user to payment page
   * 4. Payment provider calls a webhook when payment succeeds
   * 5. The webhook calls handlePaymentSuccess
   *
   * For testing, you could manually call handlePaymentSuccess or skip to a test payment endpoint.
   */
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

  /**
   * POST webhook: Payment provider (Stripe, etc.) calls this when payment succeeds.
   * This endpoint should be protected by verifying the webhook signature from your provider.
   * For development, you may disable auth; in production, always verify signatures.
   */
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
        totalAmount: webhook.total_amount,
        transactionRef: webhook.transaction_uuid,
        productCode: webhook.product_code,
        signature: webhook.signature,
        signedFieldNames: webhook.signed_field_names,
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
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * POST for testing: Manually trigger payment success (dev/admin only)
   * Remove or protect this in production.
   */
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
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
