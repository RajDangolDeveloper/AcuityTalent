import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendOtp } from 'src/modules/auth/dto/sendOtp.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendOtpEmail(sendOtp: SendOtp) {
    const { email, otp } = sendOtp;

    const mailOptions = {
      from: `"AcuityTalent" <${this.configService.get('MAIL_FROM')}>`,
      to: email,
      subject: 'Your Verification Code',
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      html: `<b>Your OTP is: ${otp}</b><p>It will expire in 5 minutes.</p>`,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  async sendShortlistEmail(data: {
    email: string;
    jobTitle: string;
    companyName: string;
  }) {
    const { email, jobTitle, companyName } = data;

    const mailOptions = {
      from: `"AcuityTalent" <${this.configService.get('MAIL_FROM')}>`,
      to: email,
      subject: `Great News! You've Been Shortlisted for ${jobTitle} at ${companyName}`,
      text: `Congratulations! You have been shortlisted for the ${jobTitle} position at ${companyName}. We look forward to proceeding with the next steps.`,
      html: `
        <h2>Congratulations!</h2>
        <p>We are pleased to inform you that you have been shortlisted for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        <p>Our team will be in touch with you soon regarding the next steps in the interview process.</p>
        <p>Best regards,<br>AcuityTalent Team</p>
      `,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send shortlist email');
    }
  }

  async sendOfferEmail(data: {
    email: string;
    jobTitle: string;
    companyName: string;
  }) {
    const { email, jobTitle, companyName } = data;

    const mailOptions = {
      from: `"AcuityTalent" <${this.configService.get('MAIL_FROM')}>`,
      to: email,
      subject: `Offer Letter: ${jobTitle} at ${companyName}`,
      text: `Congratulations! We are pleased to offer you the position of ${jobTitle} at ${companyName}. Please review the offer details and respond at your earliest convenience.`,
      html: `
        <h2>Offer Letter</h2>
        <p>Congratulations!</p>
        <p>We are pleased to extend an offer for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <p>Please review the offer details and let us know your acceptance at your earliest convenience.</p>
        <p>We look forward to welcoming you to our team!</p>
        <p>Best regards,<br>AcuityTalent Team</p>
      `,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send offer email');
    }
  }

  async sendRejectionEmail(data: {
    email: string;
    jobTitle: string;
    companyName: string;
  }) {
    const { email, jobTitle, companyName } = data;

    const mailOptions = {
      from: `"AcuityTalent" <${this.configService.get('MAIL_FROM')}>`,
      to: email,
      subject: `Application Status Update: ${jobTitle} at ${companyName}`,
      text: `Thank you for your interest in the ${jobTitle} position at ${companyName}. We appreciate the time and effort you invested in the application process.`,
      html: `
        <h2>Application Status Update</h2>
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        <p>We appreciate the time and effort you invested in the application process. While we were impressed by your qualifications, we have decided to move forward with other candidates at this time.</p>
        <p>We encourage you to apply for future positions that match your profile.</p>
        <p>Best regards,<br>AcuityTalent Team</p>
      `,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send rejection email');
    }
  }

  async sendApplicationNotificationEmail(data: {
    email: string;
    candidateName: string;
    jobTitle: string;
    candidateEmail: string;
  }) {
    const { email, candidateName, jobTitle, candidateEmail } = data;

    const mailOptions = {
      from: `"AcuityTalent" <${this.configService.get('MAIL_FROM')}>`,
      to: email,
      subject: `New Application: ${candidateName} for ${jobTitle}`,
      text: `A new candidate has applied for your job posting. Candidate: ${candidateName} (${candidateEmail})`,
      html: `
        <h2>New Application Received</h2>
        <p>A new candidate has applied for your job posting:</p>
        <ul>
          <li><strong>Job Title:</strong> ${jobTitle}</li>
          <li><strong>Candidate:</strong> ${candidateName}</li>
          <li><strong>Email:</strong> ${candidateEmail}</li>
        </ul>
        <p>Please log in to AcuityTalent to review the application and the candidate's resume.</p>
        <p>Best regards,<br>AcuityTalent Team</p>
      `,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send application notification email',
      );
    }
  }

  async sendInterviewScheduledEmail(data: {
    email: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    interviewType: string;
    scheduledAt: Date;
    meetingLink?: string;
  }) {
    const {
      email,
      candidateName,
      jobTitle,
      companyName,
      interviewType,
      scheduledAt,
      meetingLink,
    } = data;

    const formattedDate = scheduledAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedTime = scheduledAt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const mailOptions = {
      from: `"AcuityTalent" <${this.configService.get('MAIL_FROM')}>`,
      to: email,
      subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
      text: `Hi ${candidateName}, your ${interviewType} interview for ${jobTitle} at ${companyName} is scheduled on ${formattedDate} at ${formattedTime}.${meetingLink ? ` Join link: ${meetingLink}` : ''}`,
      html: `
        <h2>Interview Scheduled</h2>
        <p>Hi <strong>${candidateName}</strong>,</p>
        <p>Your <strong>${interviewType}</strong> interview for the <strong>${jobTitle}</strong> role at <strong>${companyName}</strong> has been scheduled.</p>
        <ul>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time:</strong> ${formattedTime}</li>
        </ul>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        <p>Please be available a few minutes before the interview starts.</p>
        <p>Best regards,<br>AcuityTalent Team</p>
      `,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send interview scheduled email',
      );
    }
  }
}
