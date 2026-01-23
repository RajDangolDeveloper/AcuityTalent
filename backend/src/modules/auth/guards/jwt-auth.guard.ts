import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard - Protects routes that require JWT authentication
 *
 * What it does:
 * 1. Checks if the request has a valid JWT token in Authorization header
 * 2. Validates the token signature and expiration
 * 3. Extracts user data from the token and attaches it to req.user
 * 4. Allows the request to proceed if token is valid
 * 5. Throws UnauthorizedException if token is missing or invalid
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Get('protected-route')
 * async protectedRoute(@Req() req: any) {
 *   console.log(req.user); // Contains decoded JWT payload
 * }
 *
 * How to include JWT token in requests:
 * Authorization: Bearer <your_jwt_token>
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // If there's an error or no user, throw UnauthorizedException
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing JWT token');
    }
    return user;
  }
}
