import { UserResponseDto } from "../types/user";

type PremiumUserLike = {
  subscriptionPlan?: UserResponseDto["subscriptionPlan"];
  subscriptionExpiresAt?: string | null;
};

const getPremiumFields = (user: unknown): PremiumUserLike | null => {
  if (!user || typeof user !== "object") return null;

  return user as PremiumUserLike;
};

export function isPremiumUser(user: unknown): boolean {
  const premiumUser = getPremiumFields(user);

  if (!premiumUser) return false;
  if (premiumUser.subscriptionPlan !== "PREMIUM") return false;
  if (!premiumUser.subscriptionExpiresAt) return false;

  const expiresAt = new Date(premiumUser.subscriptionExpiresAt);
  return expiresAt > new Date();
}

export function getDaysRemaining(user: unknown): number | null {
  const premiumUser = getPremiumFields(user);

  if (!premiumUser || !premiumUser.subscriptionExpiresAt) return null;

  const expiresAt = new Date(premiumUser.subscriptionExpiresAt);
  const now = new Date();

  if (expiresAt <= now) return 0;

  const daysRemaining = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  return daysRemaining;
}

export function formatExpiryDate(expiresAt: string | null): string {
  if (!expiresAt) return "None";

  const date = new Date(expiresAt);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getSubscriptionStatusString(user: unknown): string {
  const premiumUser = getPremiumFields(user);

  if (!premiumUser) return "No user";

  if (premiumUser.subscriptionPlan === "NON_PREMIUM") {
    return "Free Plan";
  }

  if (!premiumUser.subscriptionExpiresAt) {
    return "Premium (No expiry set)";
  }

  const daysRemaining = getDaysRemaining(premiumUser);

  if (daysRemaining === null || daysRemaining <= 0) {
    return "Premium (Expired)";
  }

  if (daysRemaining <= 7) {
    return `Premium (Expires in ${daysRemaining} days)`;
  }

  return `Premium (Expires ${formatExpiryDate(premiumUser.subscriptionExpiresAt)})`;
}
