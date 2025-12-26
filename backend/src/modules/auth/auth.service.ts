// src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ForgetPasswordDto } from './dto/forgotPassword.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

      const isPasswordValid = password === user.passwordHash;

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid Credentials');
      }

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new UnauthorizedException('Authenticated Failed');
    }
  }

  async registerUser(registerDto: RegisterDto): Promise<any> {
    try {
      const result = await this.prisma.user.create({ data: registerDto });
      return result;
    } catch (error) {
      throw new error();
    }
  }

  async findUser(forgetPasswordDto: ForgetPasswordDto): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: forgetPasswordDto.email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
        },
      });

      if (!user) {
        return false;
      }

      return true;
    } catch (error) {
      throw new error();
    }
  }
}
