import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './config/email.service';

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
  async sendTestEmail(): Promise<{ statusCode: number; message: string }> {
    await this.emailService.sendTestEmail('rajdangol.dev@gmail.com');

    return {
      statusCode: 200,
      message: 'Test email sent to rajdangol.dev@gmail.com',
    };
  }
}
