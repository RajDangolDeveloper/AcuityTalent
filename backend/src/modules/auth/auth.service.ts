// src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ForgetPasswordDto } from './dto/forgotPassword.dto';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from 'src/config/password.service';
import { FindUser } from './dto/findUser.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
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
      registerDto.passwordHash,
    );

    const { passwordHash, ...userData } = registerDto;

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
    const user = this.findUser(forgetPassword.email);
  }

  async updatePassword(updatePassword: UpdatePasswordDto) {
    const user = this.findUser(updatePassword.email);
  }

  async createOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }
}
