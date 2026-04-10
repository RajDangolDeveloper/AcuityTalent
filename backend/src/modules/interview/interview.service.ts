import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Interview,
  InterviewStatus,
  ApplicationStatus,
  ParticipantRole,
  ParticipantStatus,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateInterviewDto } from './dto/createInterview.dto';
import { UpdateInterviewDto } from './dto/updateInterview.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecruiterService } from '../recruiters/recruiter.service';
import { ApplicationService } from '../applications/applications.service';
import { EmailService } from 'src/config/email.service';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recruiterService: RecruiterService,
    private readonly applicationService: ApplicationService,
    private readonly emailService: EmailService,
  ) {}

  private async startDueScheduledInterviews(): Promise<void> {
    const dueInterviews = await this.prisma.interview.findMany({
      where: {
        status: InterviewStatus.SCHEDULED,
        scheduledAt: {
          lte: new Date(),
        },
      },
      select: {
        id: true,
        scheduledAt: true,
        actualStartAt: true,
      },
    });

    if (!dueInterviews.length) {
      return;
    }

    await this.prisma.$transaction(
      dueInterviews.map((interview) =>
        this.prisma.interview.update({
          where: { id: interview.id },
          data: {
            status: InterviewStatus.IN_PROGRESS,
            actualStartAt: interview.actualStartAt ?? interview.scheduledAt,
          },
        }),
      ),
    );
  }

  async create(createInterviewDto: CreateInterviewDto): Promise<Interview> {
    const scheduledAt = new Date(createInterviewDto.scheduledAt);
    const shouldStartImmediately = scheduledAt <= new Date();

    const recruiter = await this.recruiterService.getRecruiterProfile(
      createInterviewDto.interviewerId,
    );

    if (!recruiter) {
      throw new NotFoundException(
        `Recruiter with ID ${createInterviewDto.interviewerId} not found`,
      );
    }

    const application = await this.prisma.application.findUnique({
      where: { id: createInterviewDto.applicationId },
      include: {
        candidate: { include: { user: true } },
        job: {
          include: {
            recruiter: {
              include: {
                user: true,
                company: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${createInterviewDto.applicationId} not found`,
      );
    }

    const candidateUserId = application.candidate.userId;
    const interviewerUserId = application.job.recruiter.userId;
    const roomId = createInterviewDto.roomId || `room_${uuidv4().slice(0, 8)}`;

    const interview = await this.prisma.interview.create({
      data: {
        applicationId: createInterviewDto.applicationId,
        interviewerId: createInterviewDto.interviewerId,
        interviewType: createInterviewDto.interviewType,
        scheduledAt,
        meetingLink: createInterviewDto.meetingLink,
        notes: createInterviewDto.notes,
        roomId,
        status: shouldStartImmediately
          ? InterviewStatus.IN_PROGRESS
          : InterviewStatus.SCHEDULED,
        actualStartAt: shouldStartImmediately ? scheduledAt : undefined,
        participants: {
          create: [
            {
              userId: candidateUserId,
              role: ParticipantRole.CANDIDATE,
              status: ParticipantStatus.WAITING,
              candidateProfileId: application.candidate.id,
            },
            {
              userId: interviewerUserId,
              role: ParticipantRole.INTERVIEWER,
              status: ParticipantStatus.WAITING,
            },
          ],
        },
      },
    });

    // Keep application state in sync with interview scheduling.
    await this.prisma.application.update({
      where: { id: createInterviewDto.applicationId },
      data: {
        status: ApplicationStatus.INTERVIEWING,
        hadInterview: true,
      },
    });

    try {
      await this.emailService.sendInterviewScheduledEmail({
        email: application.candidate.user.email,
        candidateName:
          `${application.candidate.user.firstName || ''} ${application.candidate.user.lastName || ''}`.trim() ||
          application.candidate.user.email,
        jobTitle: application.job.title,
        companyName: application.job.recruiter.company.name,
        interviewType: createInterviewDto.interviewType,
        scheduledAt,
        meetingLink: createInterviewDto.meetingLink,
      });
    } catch (error) {
      // Email failures should not block scheduling.
      console.error('Failed to send interview scheduled email:', error);
    }

    return interview;
  }

  async sendDecision(
    applicationId: number,
    decision: 'OFFER' | 'REJECTED',
    userId: number,
  ) {
    if (decision === 'OFFER') {
      return this.applicationService.acceptApplication(applicationId, userId);
    }

    if (decision === 'REJECTED') {
      return this.applicationService.rejectApplication(applicationId, userId);
    }

    throw new BadRequestException('Decision must be OFFER or REJECTED');
  }

  async updateNotes(id: number, notes: string): Promise<Interview> {
    return this.update(id, { notes });
  }

  async updateStatus(id: number, status: InterviewStatus): Promise<Interview> {
    const updateData: UpdateInterviewDto = {
      status,
    };

    if (status === InterviewStatus.IN_PROGRESS) {
      updateData.actualStartAt = new Date();
    }

    if (status === InterviewStatus.COMPLETED) {
      updateData.actualEndAt = new Date();
    }

    return this.update(id, updateData);
  }

  async findAll(): Promise<Interview[]> {
    await this.startDueScheduledInterviews();

    return this.prisma.interview.findMany({
      include: {
        application: {
          include: {
            candidate: {
              include: {
                user: true,
              },
            },
            job: true,
          },
        },
        interviewer: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async findByCandidate(candidateId: number): Promise<Interview[]> {
    await this.startDueScheduledInterviews();

    return this.prisma.interview.findMany({
      where: {
        application: {
          candidateId,
        },
      },
      include: {
        application: {
          include: {
            candidate: {
              include: {
                user: true,
              },
            },
            job: true,
          },
        },
        interviewer: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async findByCurrentCandidateUserId(userId: number): Promise<Interview[]> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new NotFoundException(
        `Candidate profile for user ${userId} not found`,
      );
    }

    return this.findByCandidate(candidate.id);
  }

  async findByCandidateMonth(
    id: number,
    year: number,
    month: number,
  ): Promise<Interview[]> {
    await this.startDueScheduledInterviews();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const user = await this.prisma.candidateProfile.findUnique({
      where: {
        userId: id,
      },
    });

    if (!user) {
      throw new NotFoundException(`Candidate with User ID ${id} not found`);
    }

    return this.prisma.interview.findMany({
      where: {
        application: {
          candidateId: user.id,
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
            candidate: {
              include: {
                user: true,
              },
            },
            job: true,
          },
        },
        interviewer: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<Interview> {
    await this.startDueScheduledInterviews();

    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: {
              include: {
                user: true,
              },
            },
            job: true,
          },
        },
        interviewer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return interview;
  }

  async findByRoomId(roomId: string): Promise<Interview> {
    await this.startDueScheduledInterviews();

    const interview = await this.prisma.interview.findUnique({
      where: { roomId },
      include: {
        application: {
          include: {
            candidate: {
              include: {
                user: true,
              },
            },
            job: true,
          },
        },
        interviewer: {
          include: {
            user: true,
          },
        },
        participants: {
          include: {
            user: true,
          },
        },
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
    return this.updateStatus(id, InterviewStatus.IN_PROGRESS);
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
