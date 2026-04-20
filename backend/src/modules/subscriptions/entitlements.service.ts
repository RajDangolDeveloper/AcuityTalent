import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Centralized entitlement service for subscription checks.
 * Handles:
 * - Job quota enforcement (free tier: 2 active jobs max per recruiter)
 * - Premium feature gating (candidates and recruiters)
 * - Subscription expiry checks
 */
@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a recruiter can create another active job.
   * Free tier: max 2 active jobs.
   * Premium tier: unlimited.
   *
   * @param recruiterId The recruiter user ID (also the company owner)
   * @returns { allowed: boolean; activeCount: number; limit: number; message?: string }
   */
  async canRecruiterCreateJob(recruiterId: number): Promise<{
    allowed: boolean;
    activeCount: number;
    limit: number;
    message?: string;
  }> {
    // Get recruiter user to check subscription
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

    // Check if subscription is expired
    const isSubscriptionActive = this.isSubscriptionActive(
      user.subscriptionExpiresAt,
    );
    const isPremium =
      user.subscriptionPlan === 'PREMIUM' && isSubscriptionActive;

    // Premium tier: unlimited jobs
    if (isPremium) {
      const activeCount = await this.countActiveJobsByRecruiter(recruiterId);
      return {
        allowed: true,
        activeCount,
        limit: -1, // Unlimited
      };
    }

    // Free tier: max 2 active jobs
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

  /**
   * Check if a candidate has active premium subscription.
   * Premium grants access to AI features like improve-text, review-resume, generate-cover-letter.
   *
   * @param candidateUserId The candidate user ID
   * @returns true if candidate has active PREMIUM subscription
   */
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

  /**
   * Check if a recruiter's org has active premium subscription.
   * Premium recruiter orgs can post unlimited jobs and may get other features.
   *
   * @param recruiterId The recruiter user ID (org owner)
   * @returns true if recruiter's org has active PREMIUM subscription
   */
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

  /**
   * Get subscription status for a user (recruiter or candidate).
   *
   * @param userId The user ID
   * @returns { isActive: boolean; isPremium: boolean; expiresAt: Date | null; daysRemaining: number | null }
   */
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

  /**
   * Renew a subscription for one year from now.
   * Called after successful payment.
   *
   * @param userId The user ID
   * @param plan The subscription plan to set (NON_PREMIUM or PREMIUM)
   */
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

  /**
   * Downgrade a subscription to NON_PREMIUM (called on expiry).
   *
   * @param userId The user ID
   */
  async downgradeExpiredSubscription(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionExpiresAt: true, subscriptionPlan: true },
    });

    if (!user || !this.isSubscriptionActive(user.subscriptionExpiresAt)) {
      // Already inactive or doesn't exist
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionPlan: 'NON_PREMIUM' },
    });
  }

  /**
   * Count active jobs (status = ACTIVE) for a recruiter.
   *
   * @param recruiterId The recruiter user ID
   * @returns Number of active jobs
   */
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

  /**
   * Helper: Check if a subscription is still active.
   * A subscription is active if expiresAt is in the future.
   *
   * @param expiresAt The subscription expiry date
   * @returns true if subscription is active
   */
  private isSubscriptionActive(expiresAt: Date | null): boolean {
    if (!expiresAt) {
      return false;
    }
    return expiresAt > new Date();
  }
}
