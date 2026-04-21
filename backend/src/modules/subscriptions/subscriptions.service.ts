import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EntitlementsService } from './entitlements.service';
import { PaymentStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createHmac } from 'crypto';

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
    callbackUrls?: {
      successUrl?: string;
      failureUrl?: string;
    },
  ): Promise<{
    paymentUrl: string;
    transactionRef: string;
    amount: number;
    formData: Record<string, string>;
  }> {
    const amount = billingCycle === 'ANNUAL' ? 1999 : 199;
    const transactionRef = `ESEWA_${userId}_${Date.now()}_${randomUUID().slice(0, 8)}`;

    await this.prisma.$transaction([
      this.prisma.subscriptionPayment.updateMany({
        where: {
          userId,
          provider: 'ESEWA',
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.FAILED,
        },
      }),
      this.prisma.subscriptionPayment.create({
        data: {
          userId,
          amount,
          provider: 'ESEWA',
          status: PaymentStatus.PENDING,
          transactionRef,
        },
      }),
    ]);

    return this.buildEsewaPayload(transactionRef, amount, callbackUrls);
  }

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

    if (webhook.planType === 'PREMIUM') {
      await this.entitlements.renewSubscription(webhook.userId, 'PREMIUM');
    }
  }

  async processPaymentFailure(webhook: {
    transactionRef: string;
    userId: number;
    amount?: number;
    provider: string;
    planType: 'PREMIUM' | 'NON_PREMIUM';
  }): Promise<void> {
    const existingPayment = await this.prisma.subscriptionPayment.findUnique({
      where: { transactionRef: webhook.transactionRef },
    });

    if (existingPayment?.status === PaymentStatus.COMPLETED) {
      return;
    }

    if (existingPayment) {
      await this.prisma.subscriptionPayment.update({
        where: { transactionRef: webhook.transactionRef },
        data: {
          status: PaymentStatus.FAILED,
          amount: webhook.amount ?? existingPayment.amount,
          provider: webhook.provider,
        },
      });
      return;
    }

    await this.prisma.subscriptionPayment.create({
      data: {
        userId: webhook.userId,
        amount: webhook.amount ?? 0,
        provider: webhook.provider,
        status: PaymentStatus.FAILED,
        transactionRef: webhook.transactionRef,
      },
    });
  }

  verifyEsewaWebhookSignature(payload: {
    signature: string;
    signedFieldNames: string;
    fields: Record<string, string | undefined>;
  }): boolean {
    const secretKey =
      this.configService.get<string>('ESEWA_SECRET_KEY') ?? '8gBm/:&EnhH.1/q';

    const signedFieldNames = payload.signedFieldNames
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean);

    if (signedFieldNames.length === 0) {
      return false;
    }

    const signatureBaseParts: string[] = [];
    for (const fieldName of signedFieldNames) {
      const fieldValue = payload.fields[fieldName];
      if (fieldValue === undefined || fieldValue === null) {
        return false;
      }
      signatureBaseParts.push(`${fieldName}=${fieldValue}`);
    }

    const signatureBase = signatureBaseParts.join(',');
    const expectedSignature = createHmac('sha256', secretKey)
      .update(signatureBase)
      .digest('base64');

    return payload.signature === expectedSignature;
  }

  async handleExpiredSubscription(userId: number): Promise<void> {
    await this.entitlements.downgradeExpiredSubscription(userId);
  }

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

  private buildEsewaPayload(
    transactionRef: string,
    amount: number,
    callbackUrls?: {
      successUrl?: string;
      failureUrl?: string;
    },
  ) {
    const paymentUrl =
      this.configService.get<string>('ESEWA_PAYMENT_URL') ??
      'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    const productCode =
      this.configService.get<string>('ESEWA_PRODUCT_CODE') ?? 'EPAYTEST';
    const successUrl =
      callbackUrls?.successUrl ??
      this.configService.get<string>('ESEWA_SUCCESS_URL') ??
      'http://localhost:3000/recruiter/settings?payment=success';
    const failureUrl =
      callbackUrls?.failureUrl ??
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
