import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecruiterProfileDto } from './dto/CreateRecruiterProfile.dto';
import { UpdateRecruiterProfileDto } from './dto/UpdateRecruiterProfile.dto';
import { DeleteRecruiterProfileDto } from './dto/DeleteRecruiterProfile.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecruiterService {
  constructor(private prisma: PrismaService) {}

  async createRecruiterProfile(userData: CreateRecruiterProfileDto) {
    const currentTime = new Date();
    return this.prisma.recruiterProfile.create({
      data: {
        userId: userData.userId!,
        companyId: userData.companyId!,
        positionTitle: userData.positionTitle,
        updatedAt: currentTime,
        createdAt: currentTime,
      },
    });
  }

  async updateRecruiterProfile(
    userId: number,
    userData: UpdateRecruiterProfileDto,
  ) {
    const userFound = await this.prisma.recruiterProfile.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!userFound) {
      throw new NotFoundException(`Recruiter with ID ${userId} not found`);
    }

    const response = this.prisma.recruiterProfile.update({
      where: {
        userId: userId,
      },
      data: {
        ...userData,
      },
    });

    return response;
  }

  async deleteRecruiterProfile(deleteData: DeleteRecruiterProfileDto) {
    const userFound = this.prisma.recruiterProfile.findFirst({
      where: {
        id: deleteData.id,
      },
    });

    if (!userFound) {
      throw new NotFoundException(
        `Recruiter with ID ${deleteData.id} not found`,
      );
    }

    const response = this.prisma.recruiterProfile.delete({
      where: {
        id: deleteData.id,
      },
    });

    return response;
  }

  async getRecruiterProfileById(id: number) {
    return await this.prisma.recruiterProfile.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        company: true,
      },
    });
  }

  async getRecruiterProfileByUserId(id: number) {
    return this.prisma.recruiterProfile.findUnique({
      where: {
        userId: id,
      },
      include: {
        user: true,
        company: true,
      },
    });
  }
}
