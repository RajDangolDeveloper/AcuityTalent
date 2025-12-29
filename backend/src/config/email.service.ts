import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendOtp } from 'src/modules/auth/dto/sendOtp.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Setup the transporter using environment variables
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendOtpEmail(sendOtp: SendOtp) {
    const { email, otp } = sendOtp;

    const mailOptions = {
      from: `"Your App Name" <${this.configService.get('MAIL_FROM')}>`,
      to: email,
      subject: 'Your Verification Code',
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      html: `<b>Your OTP is: ${otp}</b><p>It will expire in 5 minutes.</p>`,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      // Using the InternalServerErrorException you imported
      throw new InternalServerErrorException('Failed to send OTP email', error);
    }
  }
}
