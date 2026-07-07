import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async getLatestUserActivity(id: number) {
    return await this.prisma.activityLog.findMany({
      where: {
        userId: id,
      },
      take: 5,
      orderBy: {
        id: 'desc',
      },
    });
  }

  async getUserActivity(id: number, page: number) {
    return await this.prisma.activityLog.findMany({
      where: {
        userId: id,
      },
      skip: page * 10 - 1,
      take: 10,
    });
  }

  async createUserActivity(dto: CreateActivityDto) {
    try {
      const query = await this.prisma.activityLog.create({
        data: {
          userId: dto.userId,
          actionType: dto.actionType,
          activityTitle: dto.activityTitle,
          createdAt: new Date(),
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Activity is successfully created',
        data: query,
      };
    } catch (err: any) {
      if (err.code === 'P2003') {
        throw new NotFoundException('User not found');
      }

      throw new InternalServerErrorException('Failed to create activity');
    }
  }

  async deleteActivity(id: number) {
    try {
      await this.prisma.activityLog.delete({
        where: {
          id: id,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Activity Id' + id + 'is successfully deleted',
      };
    } catch (err: any) {
      if (err.code === 'P2003') {
        throw new NotFoundException('Id not found');
      }

      throw new InternalServerErrorException('Failed to create activity');
    }
  }
}
