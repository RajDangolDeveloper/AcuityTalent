// src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgetPasswordDto } from './dto/forgotPassword.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { User } from '@prisma/client';
import { SendOtp } from './dto/sendOtp.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { JwtService } from '@nestjs/jwt';
import { CandidateService } from '../candidates/candidate.service';
import { RecruiterService } from '../recruiters/recruiter.service';
import { CreateCandidateProfileDto } from '../candidates/dto/create-candidate-profile.dto';
import { CreateRecruiterProfileDto } from '../recruiters/dto/CreateRecruiterProfile.dto';
import { EmailService } from '../../config/email.service';
import { PasswordService } from '../../config/password.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private candidateService: CandidateService,
    private recruiterService: RecruiterService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    try {
      const email = loginDto.email;
      const password = loginDto.password;

      const user = await this.prisma.user.findUnique({
        where: { email: email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          isOnboarded: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.passwordService.comparePassword(
        password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid Credentials');
      }

      const { passwordHash, ...userWithoutPassword } = user;

      const accessToken = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          isOnboarded: user.isOnboarded,
        },
        {
          expiresIn: '24h',
        },
      );

      return {
        ...userWithoutPassword,
        access_token: accessToken,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Authenticated Failed');
    }
  }

  async registerUser(registerDto: RegisterDto): Promise<any> {
    const isUserAvailable = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (isUserAvailable) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await this.passwordService.hashPassword(
      registerDto.password,
    );

    const { password, ...userData } = registerDto;

    if (registerDto.role === 'ADMIN') {
      throw new BadRequestException('Cannot create ADMIN user');
    }

    const result = await this.prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword,
      },
    });

    if (registerDto.role === 'CANDIDATE') {
      const emptyProfile = new CreateCandidateProfileDto();
      this.candidateService.createCandidateProfile(result.id, emptyProfile);
    }

    const { passwordHash: _, ...userWithoutPassword } = result;

    console.log();

    const accessToken = this.jwtService.sign({
      id: result.id,
      email: result.email,
      role: result.role,
      isOnboarded: result.isOnboarded,
    });

    return {
      ...userWithoutPassword,
      access_token: accessToken,
    };
  }

  async findUser(findUser: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: findUser },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        firstName: true,
        lastName: true,
        profilePictureUrl: true,
        contactPhone: true,
        contactEmail: true,
        isOnboarded: true,
        subscriptionPlan: true,
        coverLetterGenerationCount: true,
        subscriptionExpiresAt: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async forgetPassword(forgetPassword: ForgetPasswordDto) {
    const user = await this.findUser(forgetPassword.email);
    const otp = await this.createOtp(forgetPassword.email);

    const otpDto: SendOtp = {
      email: user.email,
      otp: Number(otp),
    };

    await this.emailService.sendOtpEmail(otpDto);

    return;
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto) {
    const findUser = await this.findUser(updatePasswordDto.email);

    const hashedPassword = await this.passwordService.hashPassword(
      updatePasswordDto.password,
    );

    const updatedUser = await this.prisma.user.update({
      where: { email: findUser.email },
      data: {
        passwordHash: hashedPassword,
      },
      select: {
        email: true,
      },
    });

    return updatedUser;
  }

  async createOtp(userEmail: string) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    await this.prisma.otp.create({
      data: {
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60000),
        user: {
          connect: { email: userEmail },
        },
      },
    });
    return otp;
  }

  async validateOtp(verifyOtp: VerifyOtpDto) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        email: verifyOtp.email,
        code: verifyOtp.otp,
      },
    });

    if (!otpRecord) {
      throw new Error('Invalid OTP code.');
    }

    const isExpired = new Date() > otpRecord.expiresAt;
    if (isExpired) {
      await this.prisma.otp.delete({ where: { id: otpRecord.id } });
      throw new Error('OTP has expired. Please request a new one.');
    }

    await this.prisma.otp.deleteMany({
      where: { email: verifyOtp.email },
    });

    return { success: true, message: 'OTP verified successfully!' };
  }
}
