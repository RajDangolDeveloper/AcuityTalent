import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInterviewDto, InterviewStatus } from './dto/createInterview.dto';
import { UpdateInterviewDto } from './dto/updateInterview.dto';
import { Interview } from '@prisma/client';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
  ) {}

  async create(createInterviewDto: CreateInterviewDto): Promise<Interview> {
    const interview = this.interviewRepository.create({
      ...createInterviewDto,
      roomId: uuidv4().slice(0, 12),
    });
    return this.interviewRepository.save(interview);
  }

  async findAll(): Promise<Interview[]> {
    return this.interviewRepository.find({
      relations: ['application', 'application.candidate', 'interviewer'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findByCandidate(candidateId: number): Promise<Interview[]> {
    return this.interviewRepository.find({
      where: { application: { candidateId } },
      relations: ['application', 'application.job', 'interviewer'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findByCandidateMonth(
    candidateId: number,
    year: number,
    month: number,
  ): Promise<Interview[]> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    return this.interviewRepository.find({
      where: {
        application: { candidateId },
        scheduledAt: { gte: startOfMonth, lte: endOfMonth },
        status: InterviewStatus.SCHEDULED,
      },
      relations: ['application', 'application.job', 'interviewer'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: [
        'application',
        'application.job',
        'application.candidate',
        'interviewer',
      ],
    });
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
    return interview;
  }

  async findByRoomId(roomId: string): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { roomId },
      relations: [
        'application',
        'application.job',
        'application.candidate',
        'interviewer',
      ],
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
    const interview = await this.findOne(id);
    Object.assign(interview, updateInterviewDto);
    return this.interviewRepository.save(interview);
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
    const result = await this.interviewRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
  }
}
