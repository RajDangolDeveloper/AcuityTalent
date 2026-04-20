import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { EntitlementsService } from '../../subscriptions/entitlements.service';

/**
 * Guard that ensures the request user has an active premium subscription.
 * Used to gate premium AI features like improve-text, review-resume, generate-cover-letter.
 *
 * Usage: @UseGuards(JwtAuthGuard, PremiumGuard)
 */
@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly entitlements: EntitlementsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Expect user to be attached by JwtAuthGuard
    if (!request.user || !request.user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const userId = request.user.id;

    // Check if user has premium subscription
    const isPremium = await this.entitlements.isCandidatePremium(userId);

    if (!isPremium) {
      throw new ForbiddenException(
        'This feature requires a premium subscription. Upgrade to access AI tools like resume review, text improvement, and cover letter generation.',
      );
    }

    return true;
  }
}
