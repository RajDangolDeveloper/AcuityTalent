import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginService } from '../users/login.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Get()
  getHello(): string {
    return this.loginService.getHello();
  }

  @Post('login')
  async loginUser(@Body() loginData: LoginDto) {
    try {
      const result = await this.loginService.validateUser(loginData);
      return result;
    } catch (error) {
      throw new error();
    }
  }
}
