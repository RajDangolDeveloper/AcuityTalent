import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { JobModule } from './modules/jobs/job.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailService } from './config/email.service';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { ApplicationModule } from './modules/applications/applications.module';
import { CandidateModule } from './modules/candidates/candidate.module';
import { CompanyModule } from './modules/companies/company.module';
import { InterviewsModule } from './modules/interview/interview.module';
import { InterviewParticipantModule } from './modules/interviewParticipant/participant.module';
import { RecruiterModule } from './modules/recruiters/recruiter.module';
import { ResumeModule } from './modules/resumes/resume.module';
import { SavedJobModule } from './modules/saved-jobs/saved-job.module';
import { UserModule } from './modules/user/user.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SpacesModule } from './modules/spaces/spaces.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
    }),
    AuthModule,
    JobModule,
    ResumeModule,
    ApplicationModule,
    CompanyModule,
    CandidateModule,
    RecruiterModule,
    UserModule,
    SavedJobModule,
    InterviewsModule,
    InterviewParticipantModule,
    AiModule,
    AdminModule,
    SpacesModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, EmailService],
})
export class AppModule {}
