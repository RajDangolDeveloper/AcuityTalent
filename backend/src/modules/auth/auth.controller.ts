import {
  BadRequestException,
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
    return await this.authService.validateUser(loginData);
  }

  @Post('register')
  async registerUser(@Body() registerData: RegisterDto) {
    return await this.authService.registerUser(registerData);
  }

  @Post('forgot-password')
  async forgetUser(@Body() forgetPasswordDto: ForgetPasswordDto) {}

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtp: UpdatePasswordDto) {}

  @Post('update-password')
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {}
}
