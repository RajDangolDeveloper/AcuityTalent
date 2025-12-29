import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { EmailService } from './config/email.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, EmailService],
})
export class AppModule {}
