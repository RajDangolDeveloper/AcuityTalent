import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';








@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  







  async canRecruiterCreateJob(recruiterId: number): Promise<{
    allowed: boolean;
    activeCount: number;
    limit: number;
    message?: string;
  }> {
    
    const user = await this.prisma.user.findUnique({
      where: { id: recruiterId },
      select: { subscriptionPlan: true, subscriptionExpiresAt: true },
    });

    if (!user) {
      return {
        allowed: false,
        activeCount: 0,
        limit: 0,
        message: 'Recruiter not found',
      };
    }

    
    const isSubscriptionActive = this.isSubscriptionActive(
      user.subscriptionExpiresAt,
    );
    const isPremium =
      user.subscriptionPlan === 'PREMIUM' && isSubscriptionActive;

    
    if (isPremium) {
      const activeCount = await this.countActiveJobsByRecruiter(recruiterId);
      return {
        allowed: true,
        activeCount,
        limit: -1, 
      };
    }

    
    const activeCount = await this.countActiveJobsByRecruiter(recruiterId);
    const limit = 2;

    if (activeCount >= limit) {
      return {
        allowed: false,
        activeCount,
        limit,
        message: `Free tier limited to ${limit} active jobs. You have ${activeCount}. Upgrade to premium to post unlimited jobs.`,
      };
    }

    return {
      allowed: true,
      activeCount,
      limit,
    };
  }

  






  async isCandidatePremium(candidateUserId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: candidateUserId },
      select: { subscriptionPlan: true, subscriptionExpiresAt: true },
    });

    if (!user) {
      return false;
    }

    return (
      user.subscriptionPlan === 'PREMIUM' &&
      this.isSubscriptionActive(user.subscriptionExpiresAt)
    );
  }

  






  async isRecruiterOrgPremium(recruiterId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: recruiterId },
      select: { subscriptionPlan: true, subscriptionExpiresAt: true },
    });

    if (!user) {
      return false;
    }

    return (
      user.subscriptionPlan === 'PREMIUM' &&
      this.isSubscriptionActive(user.subscriptionExpiresAt)
    );
  }

  





  async getSubscriptionStatus(userId: number): Promise<{
    isActive: boolean;
    isPremium: boolean;
    expiresAt: Date | null;
    daysRemaining: number | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true, subscriptionExpiresAt: true },
    });

    if (!user) {
      return {
        isActive: false,
        isPremium: false,
        expiresAt: null,
        daysRemaining: null,
      };
    }

    const isActive = this.isSubscriptionActive(user.subscriptionExpiresAt);
    const isPremium = user.subscriptionPlan === 'PREMIUM' && isActive;
    const daysRemaining = user.subscriptionExpiresAt
      ? Math.ceil(
          (user.subscriptionExpiresAt.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    return {
      isActive,
      isPremium,
      expiresAt: user.subscriptionExpiresAt,
      daysRemaining: daysRemaining && daysRemaining < 0 ? 0 : daysRemaining,
    };
  }

  






  async renewSubscription(
    userId: number,
    plan: 'PREMIUM' | 'NON_PREMIUM' = 'PREMIUM',
  ): Promise<{ subscriptionExpiresAt: Date | null }> {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: plan,
        subscriptionExpiresAt: expiresAt,
      },
      select: { subscriptionExpiresAt: true },
    });
  }

  




  async downgradeExpiredSubscription(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionExpiresAt: true, subscriptionPlan: true },
    });

    if (!user || !this.isSubscriptionActive(user.subscriptionExpiresAt)) {
      
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionPlan: 'NON_PREMIUM' },
    });
  }

  





  private async countActiveJobsByRecruiter(
    recruiterId: number,
  ): Promise<number> {
    return this.prisma.job.count({
      where: {
        recruiterId,
        status: 'ACTIVE',
      },
    });
  }

  






  private isSubscriptionActive(expiresAt: Date | null): boolean {
    if (!expiresAt) {
      return false;
    }
    return expiresAt > new Date();
  }
}
