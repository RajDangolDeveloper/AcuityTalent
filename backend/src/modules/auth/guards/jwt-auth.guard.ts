import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Validate token structure and user data
    if (err) {
      throw new UnauthorizedException({
        message: 'Invalid or expired JWT token',
        error: err.message,
      });
    }

    if (!user) {
      throw new UnauthorizedException({
        message: 'No user found in JWT token',
        error: info?.message || 'Invalid token',
      });
    }

    // Ensure user has required fields matching frontend session structure
    if (!user.id || !user.email || !user.role) {
      throw new UnauthorizedException({
        message: 'Incomplete user data in JWT token',
        error: 'Missing required fields: id, email, or role',
      });
    }

    return user;
  }
}
