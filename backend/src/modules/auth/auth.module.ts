import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CandidateService } from '../candidates/candidate.service';
import { AiModule } from '../ai/ai.module';
import { CandidateModule } from '../candidates/candidate.module';
import { RecruiterModule } from '../recruiters/recruiter.module';
import { EmailService } from '../../config/email.service';
import { PasswordService } from '../../config/password.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24hr',
        },
      }),
      inject: [ConfigService],
    }),
    AiModule,
    CandidateModule,
    RecruiterModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    PasswordService,
    EmailService,
    CandidateService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    PasswordService,
    JwtStrategy,
    JwtAuthGuard,
    PassportModule,
  ],
})
export class AuthModule {}
