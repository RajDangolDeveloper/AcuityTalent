import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { EntitlementsService } from '../../subscriptions/entitlements.service';







@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly entitlements: EntitlementsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    
    if (!request.user || !request.user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const userId = request.user.id;

    
    const isPremium = await this.entitlements.isCandidatePremium(userId);

    if (!isPremium) {
      throw new ForbiddenException(
        'This feature requires a premium subscription. Upgrade to access AI tools like resume review, text improvement, and cover letter generation.',
      );
    }

    return true;
  }
}
