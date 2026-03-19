import { PrismaService } from 'src/prisma/prisma.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class RecruiterService {
  constructor(private prisma: PrismaService) {}
}
