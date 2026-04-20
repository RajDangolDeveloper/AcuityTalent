import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Req,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgetPasswordDto } from './dto/forgotPassword.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @Post('forget-password')
  async forgetUser(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return await this.authService.forgetPassword(forgetPasswordDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtp: VerifyOtpDto) {
    return await this.authService.validateOtp(verifyOtp);
  }

  @Post('update-password')
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return await this.authService.updatePassword(updatePasswordDto);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return await this.authService.changePassword(Number(req.user.id), dto);
  }
}
