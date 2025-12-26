import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgetPasswordDto } from './dto/forgotPassword.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginUser(@Body() loginData: LoginDto) {
    try {
      const result = await this.authService.validateUser(loginData);
      return result;
    } catch (error) {
      throw new error();
    }
  }

  @Post('register')
  async registerUser(@Body() registerData: RegisterDto) {
    try {
      const result = await this.authService.registerUser(registerData);
      return result;
    } catch (error) {
      throw new error();
    }
  }

  @Post('forgot-password')
  async forgotUser(@Body() forgetPasswordDto: ForgetPasswordDto) {
    try {
      const result = await this.authService.findUser(forgetPasswordDto);
    } catch (error) {
      throw new error();
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtp: UpdatePasswordDto) {
    try {
    } catch (error) {}
  }

  @Post('update-password')
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    try {
    } catch (error) {}
  }
}
