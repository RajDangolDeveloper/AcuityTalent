// src/auth/strategies/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Recommended for fetching the secret

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Configure where the strategy should look for the token (Bearer token in the Authorization header)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Ensure tokens are rejected if expired
      ignoreExpiration: false,

      // The secret key used to verify the token's signature
      secretOrKey: configService.get('JWT_SECRET'), // Use ConfigService.get('JWT_SECRET') in a real app
    });
  }
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };

    /* * Pro Tip: If you need to check the database (e.g., to ensure the user hasn't been banned
     * since the token was issued), you would inject your UsersService/PrismaService here
     * and perform that check before returning.
     */
  }
}
