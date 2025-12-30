// src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ForgetPasswordDto } from './dto/forgotPassword.dto';
import { PasswordService } from 'src/config/password.service';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { User } from '@prisma/client';
import { EmailService } from 'src/config/email.service';
import { SendOtp } from './dto/sendOtp.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private emailService: EmailService,
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
      return userWithoutPassword;
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

    const { passwordHash: _, ...userWithoutPassword } = result;
    return userWithoutPassword;
  }

  async findUser(findUser: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: findUser },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
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

    const updatePassword = await this.passwordService.hashPassword(
      updatePasswordDto.passwordHash,
    );

    const updatedUser = await this.prisma.user.update({
      where: { email: findUser.email },
      data: {
        passwordHash: updatePassword,
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
