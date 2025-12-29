import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './config/email.service';
import { SendOtp } from './modules/auth/dto/sendOtp.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-email')
  sendTestEmail(): void {
    const email = 'rameshoer827@gmail.com';
    const otp = 800000;
    const sendOtp: SendOtp = {
      email,
      otp,
    };
    this.emailService.sendOtpEmail(sendOtp);
  }
}
