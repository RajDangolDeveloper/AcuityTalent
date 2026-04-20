import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EntitlementsService } from './entitlements.service';
import { PaymentStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createHmac } from 'crypto';

/**
 * SubscriptionsService handles subscription renewals and payment processing.
 * Works with EntitlementsService for entitlement checks.
 */
@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementsService,
    private readonly configService: ConfigService,
  ) {}

  async initiateEsewaUpgrade(
    userId: number,
    billingCycle: 'ANNUAL' | 'MONTHLY' = 'ANNUAL',
  ): Promise<{
    paymentUrl: string;
    transactionRef: string;
    amount: number;
    formData: Record<string, string>;
  }> {
    const activePending = await this.prisma.subscriptionPayment.findFirst({
      where: {
        userId,
        provider: 'ESEWA',
        status: PaymentStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (activePending) {
      return this.buildEsewaPayload(
        activePending.transactionRef,
        activePending.amount,
      );
    }

    const amount = billingCycle === 'ANNUAL' ? 1999 : 199;
    const transactionRef = `ESEWA_${userId}_${Date.now()}_${randomUUID().slice(0, 8)}`;

    await this.prisma.subscriptionPayment.create({
      data: {
        userId,
        amount,
        provider: 'ESEWA',
        status: PaymentStatus.PENDING,
        transactionRef,
      },
    });

    return this.buildEsewaPayload(transactionRef, amount);
  }

  /**
   * Get user's current subscription status including expiry and plan type.
   *
   * @param userId The user ID
   * @returns Subscription status object
   */
  async getUserSubscriptionStatus(userId: number): Promise<{
    userId: number;
    subscriptionPlan: string;
    isActive: boolean;
    isPremium: boolean;
    expiresAt: Date | null;
    daysRemaining: number | null;
  }> {
    const subscriptionStatus =
      await this.entitlements.getSubscriptionStatus(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true },
    });

    return {
      userId,
      subscriptionPlan: user?.subscriptionPlan || 'NON_PREMIUM',
      ...subscriptionStatus,
    };
  }

  /**
   * Process successful payment and activate/renew subscription.
   * Called by the payment provider's webhook.
   *
   * @param webhook Payment webhook data
   */
  async processPaymentSuccess(webhook: {
    transactionRef: string;
    userId: number;
    amount: number;
    provider: string;
    planType: 'PREMIUM' | 'NON_PREMIUM';
  }): Promise<void> {
    const existingPayment = await this.prisma.subscriptionPayment.findUnique({
      where: { transactionRef: webhook.transactionRef },
    });

    if (existingPayment?.status === PaymentStatus.COMPLETED) {
      return;
    }

    const payment = existingPayment
      ? await this.prisma.subscriptionPayment.update({
          where: { transactionRef: webhook.transactionRef },
          data: {
            status: PaymentStatus.COMPLETED,
            amount: webhook.amount,
            provider: webhook.provider,
          },
        })
      : await this.prisma.subscriptionPayment.create({
          data: {
            userId: webhook.userId,
            amount: webhook.amount,
            provider: webhook.provider,
            status: PaymentStatus.COMPLETED,
            transactionRef: webhook.transactionRef,
          },
        });

    // Renew subscription (set to expire one year from now)
    if (webhook.planType === 'PREMIUM') {
      await this.entitlements.renewSubscription(webhook.userId, 'PREMIUM');
    }
  }

  verifyEsewaWebhookSignature(payload: {
    totalAmount: string;
    transactionRef: string;
    productCode: string;
    signature: string;
    signedFieldNames: string;
  }): boolean {
    const secretKey =
      this.configService.get<string>('ESEWA_SECRET_KEY') ?? '8gBm/:&EnhH.1/q';

    const signatureBase = `total_amount=${payload.totalAmount},transaction_uuid=${payload.transactionRef},product_code=${payload.productCode}`;
    const expectedSignature = createHmac('sha256', secretKey)
      .update(signatureBase)
      .digest('base64');

    return (
      payload.signedFieldNames ===
        'total_amount,transaction_uuid,product_code' &&
      payload.signature === expectedSignature
    );
  }

  /**
   * Downgrade a user's subscription if it has expired.
   * Called by background jobs or on-read checks.
   *
   * @param userId The user ID
   */
  async handleExpiredSubscription(userId: number): Promise<void> {
    await this.entitlements.downgradeExpiredSubscription(userId);
  }

  /**
   * Get all payments for a user (for history/invoices).
   *
   * @param userId The user ID
   * @returns List of payments
   */
  async getUserPaymentHistory(userId: number): Promise<any[]> {
    return this.prisma.subscriptionPayment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentStatusByTransactionRef(
    userId: number,
    transactionRef: string,
  ) {
    const payment = await this.prisma.subscriptionPayment.findUnique({
      where: { transactionRef },
      select: {
        transactionRef: true,
        status: true,
        amount: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!payment || payment.userId !== userId) {
      throw new BadRequestException('Payment not found');
    }

    const { userId: _, ...safePayment } = payment;
    return safePayment;
  }

  private buildEsewaPayload(transactionRef: string, amount: number) {
    const paymentUrl =
      this.configService.get<string>('ESEWA_PAYMENT_URL') ??
      'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    const productCode =
      this.configService.get<string>('ESEWA_PRODUCT_CODE') ?? 'EPAYTEST';
    const successUrl =
      this.configService.get<string>('ESEWA_SUCCESS_URL') ??
      'http://localhost:3000/recruiter/settings?payment=success';
    const failureUrl =
      this.configService.get<string>('ESEWA_FAILURE_URL') ??
      'http://localhost:3000/recruiter/settings?payment=failed';
    const secretKey =
      this.configService.get<string>('ESEWA_SECRET_KEY') ?? '8gBm/:&EnhH.1/q';

    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    const signatureBase = `total_amount=${amount},transaction_uuid=${transactionRef},product_code=${productCode}`;
    const signature = createHmac('sha256', secretKey)
      .update(signatureBase)
      .digest('base64');

    const formData: Record<string, string> = {
      amount: amount.toString(),
      tax_amount: '0',
      total_amount: amount.toString(),
      transaction_uuid: transactionRef,
      product_code: productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: signedFieldNames,
      signature,
    };

    return {
      paymentUrl,
      transactionRef,
      amount,
      formData,
    };
  }
}
