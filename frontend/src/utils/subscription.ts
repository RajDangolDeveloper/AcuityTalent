




import { UserResponseDto } from "@/types/user";




export function isPremiumUser(user: UserResponseDto | null): boolean {
  if (!user) return false;
  if (user.subscriptionPlan !== "PREMIUM") return false;
  if (!user.subscriptionExpiresAt) return false;

  const expiresAt = new Date(user.subscriptionExpiresAt);
  return expiresAt > new Date();
}





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




export function formatExpiryDate(expiresAt: string | null): string {
  if (!expiresAt) return "None";

  const date = new Date(expiresAt);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}




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
