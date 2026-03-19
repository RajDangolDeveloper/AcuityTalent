import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecruiterService } from './recruiter.service';

@Controller('recruiter')
@UseGuards(JwtAuthGuard)
export class RecruiterController {
  constructor(private candidateService: RecruiterService) {}
}
