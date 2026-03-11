import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { EmailService } from './config/email.service';
import { ResumeModule } from './modules/resumes/resume.module';
import { JobModule } from './modules/jobs/job.module';
import { ApplicationModule } from './modules/applications/applications.module';
import { CompanyModule } from './modules/companies/company.module';
import { CandidateModule } from './modules/candidates/candidate.module';
import { SavedJobModule } from './modules/saved-jobs/saved-job.module';

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
    SavedJobModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, EmailService],
})
export class AppModule {}
