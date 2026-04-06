import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Interview, InterviewStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateInterviewDto } from './dto/createInterview.dto';
import { UpdateInterviewDto } from './dto/updateInterview.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InterviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInterviewDto: CreateInterviewDto): Promise<Interview> {
    return this.prisma.interview.create({
      data: {
        ...createInterviewDto,
        roomId: uuidv4().slice(0, 12),
        status: InterviewStatus.SCHEDULED,
      },
    });
  }

  async findAll(): Promise<Interview[]> {
    return this.prisma.interview.findMany({
      include: {
        application: {
          include: {
            candidate: true,
          },
        },
        interviewer: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async findByCandidate(candidateId: number): Promise<Interview[]> {
    return this.prisma.interview.findMany({
      where: {
        application: {
          candidateId,
        },
      },
      include: {
        application: {
          include: {
            job: true,
          },
        },
        interviewer: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async findByCandidateMonth(
    candidateId: number,
    year: number,
    month: number,
  ): Promise<Interview[]> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    return this.prisma.interview.findMany({
      where: {
        application: {
          candidateId,
        },
        scheduledAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: InterviewStatus.SCHEDULED,
      },
      include: {
        application: {
          include: {
            job: true,
          },
        },
        interviewer: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        interviewer: true,
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return interview;
  }

  async findByRoomId(roomId: string): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({
      where: { roomId },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        interviewer: true,
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with Room ID ${roomId} not found`);
    }

    return interview;
  }

  async update(
    id: number,
    updateInterviewDto: UpdateInterviewDto,
  ): Promise<Interview> {
    try {
      return await this.prisma.interview.update({
        where: { id },
        data: updateInterviewDto,
      });
    } catch (error) {
      if (error) {
        throw new NotFoundException(`Interview with ID ${id} not found`);
      }
      throw error;
    }
  }

  async markInProgress(id: number): Promise<Interview> {
    return this.update(id, {
      status: InterviewStatus.IN_PROGRESS,
      actualStartAt: new Date(),
    });
  }

  async markCompleted(id: number, recordingUrl?: string): Promise<Interview> {
    return this.update(id, {
      status: InterviewStatus.COMPLETED,
      actualEndAt: new Date(),
      recordingUrl,
    });
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.interview.delete({ where: { id } });
    } catch (error) {
      if (error) {
        throw new NotFoundException(`Interview with ID ${id} not found`);
      }
      throw error;
    }
  }
}
