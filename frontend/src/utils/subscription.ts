/**
 * Utility functions for subscription entitlement checks on the frontend.
 * Mirrors backend EntitlementsService logic for consistency.
 */

import { UserResponseDto } from "@/types/user";

/**
 * Check if a user has an active premium subscription.
 */
export function isPremiumUser(user: UserResponseDto | null): boolean {
  if (!user) return false;
  if (user.subscriptionPlan !== "PREMIUM") return false;
  if (!user.subscriptionExpiresAt) return false;

  const expiresAt = new Date(user.subscriptionExpiresAt);
  return expiresAt > new Date();
}

/**
 * Get days remaining on a premium subscription.
 * Returns null if not premium or already expired.
 */
export function getDaysRemaining(user: UserResponseDto | null): number | null {
  if (!user || !user.subscriptionExpiresAt) return null;

  const expiresAt = new Date(user.subscriptionExpiresAt);
  const now = new Date();

  if (expiresAt <= now) return 0;

  const daysRemaining = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  return daysRemaining;
}

/**
 * Format subscription expiry date for display.
 */
export function formatExpiryDate(expiresAt: string | null): string {
  if (!expiresAt) return "None";

  const date = new Date(expiresAt);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get a human-readable subscription status string.
 */
export function getSubscriptionStatusString(
  user: UserResponseDto | null,
): string {
  if (!user) return "No user";

  if (user.subscriptionPlan === "NON_PREMIUM") {
    return "Free Plan";
  }

  if (!user.subscriptionExpiresAt) {
    return "Premium (No expiry set)";
  }

  const daysRemaining = getDaysRemaining(user);

  if (daysRemaining === null || daysRemaining <= 0) {
    return "Premium (Expired)";
  }

  if (daysRemaining <= 7) {
    return `Premium (Expires in ${daysRemaining} days)`;
  }

  return `Premium (Expires ${formatExpiryDate(user.subscriptionExpiresAt)})`;
}
