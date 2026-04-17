import { CreateParticipantDto } from './dto/CreateParticipantDto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateParticipantDto } from './dto/UpdateParticipantDto';
import { DeleteParticipantDto } from './dto/DeleteParticipantDto';
import { FindAllParticipantDto } from './dto/FindAllParticipants.Dto';
import { UserService } from '../user/user.service';
import { InterviewsService } from '../interview/interview.service';
import { FindParticipantDto } from './dto/FindParticipant.Dto';
import { PrismaService } from '../../prisma/prisma.service';

export class InterviewParticipantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly user: UserService,
    private readonly interview: InterviewsService,
  ) {}

  async createParticipant(dto: CreateParticipantDto) {
    try {
      const user = this.user.getUserById(dto.userId);

      if (!user) {
        return new NotFoundException(`User not found ${dto.userId}`);
      }

      const interview = this.interview.findOne(dto.interviewId);

      if (!interview) {
        return new NotFoundException(`User not found ${dto.userId}`);
      }

      return await this.prisma.interviewParticipant.create({
        data: {
          interviewId: dto.interviewId,
          userId: dto.userId,
          role: dto.role,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'This user is already a participant of this interview',
          );
        }
      }
      throw error;
    }
  }

  async updateParticipant(dto: UpdateParticipantDto) {
    const { id, ...updateData } = dto;

    const participant = this.findParticipant(id);

    if (!participant) {
      return new NotFoundException(`Participant was not found with id ${id}`);
    }
    return await this.prisma.interviewParticipant.update({
      where: {
        id: dto.id,
      },
      data: {
        ...updateData,
      },
    });
  }

  async deleteParticipant(dto: DeleteParticipantDto) {
    const participant = this.findParticipant(dto.id);

    if (!participant) {
      return new NotFoundException(
        `Participant was not found with id ${dto.id}`,
      );
    }
    return await this.prisma.interviewParticipant.delete({
      where: {
        id: dto.id,
      },
    });
  }

  async findAllParticipant(dto: FindAllParticipantDto) {
    return await this.prisma.interviewParticipant.findMany({
      where: {
        interview: {
          id: dto.id,
        },
      },
    });
  }

  async findParticipant(id: number) {
    return await this.prisma.interviewParticipant.findUnique({
      where: {
        id: id,
      },
    });
  }
}
