import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CandidateService } from '../candidates/candidate.service';
import { JobService } from '../jobs/job.service';
import { RecruiterService } from '../recruiters/recruiter.service';
import { createInterviewRequestDto } from './dto/createInterviewRequest.dto';
import { updateInterviewRequestDto } from './dto/updateInterviewRequest.dto';
import { ApplicationService } from '../applications/applications.service';
import { InterviewRequestStatus, InterviewType } from '@prisma/client';
import { InterviewsService } from '../interview/interview.service';
import { CreateInterviewDto } from '../interview/dto/createInterview.dto';

@Injectable()
export class InterviewRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobService: JobService,
    private readonly candidateService: CandidateService,
    private readonly recruiterService: RecruiterService,
    private readonly applicationService: ApplicationService,
    private readonly interviewService: InterviewsService,
  ) {}

  async getInterviewRequest(id: number) {
    try {
      return await this.prisma.interviewRequest.findFirstOrThrow({
        where: {
          id: id,
        },
      });
    } catch (error) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  async getInterviewRequestsByCandidate(id: number) {
    try {
      const candidate = await this.candidateService.getCandidateProfile(id);

      return this.prisma.interviewRequest.findMany({
        where: {
          candidateId: candidate.id,
        },
        include: {
          job: true,
        },
      });
    } catch (error: any) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  async getInterviewRequestsByRecruiter(id: number) {
    try {
      const recruiter = await this.recruiterService.getRecruiterProfileById(id);

      return await this.prisma.interviewRequest.findMany({
        where: {
          recruiterId: recruiter?.id,
        },
        include: {
          job: true,
        },
      });
    } catch (error: any) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  async createInterviewRequest(dto: createInterviewRequestDto, userId: number) {
    const [findJob, findCandidate, findRecruiter, findApplication] =
      await Promise.all([
        this.jobService.getJobById(dto.jobId),
        this.candidateService.getCandidateProfileById(dto.candidateId),
        this.recruiterService.getRecruiterProfileByUserId(userId),
        this.applicationService.getApplicationById(dto.applicationId, userId),
      ]);

    if (!findJob) {
      throw new NotFoundException(`Job with ID ${dto.jobId} was not found`);
    }

    if (!findCandidate) {
      throw new NotFoundException(
        `Candidate with ID ${dto.candidateId} was not found`,
      );
    }

    if (!findRecruiter) {
      throw new NotFoundException(`Recruiter with ID ${userId} was not found`);
    }

    try {
      const interviewRequest = await this.prisma.interviewRequest.create({
        data: { ...dto, recruiterId: findRecruiter.data!.id },
      });

      return interviewRequest;
    } catch (error) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  async updateInterviewRequest(dto: updateInterviewRequestDto) {
    try {
      const interviewRequest = await this.prisma.interviewRequest.findUnique({
        where: {
          id: dto.id,
        },
      });

      if (!interviewRequest) {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Interview Request not found',
        };
      }

      if (dto.status === InterviewRequestStatus.CONFIRMED) {
        await this.interviewService.create({
          applicationId: interviewRequest.applicationId,
          interviewerId: interviewRequest.recruiterId,
          scheduledAt: new Date(interviewRequest.selectedDateTime!),
          interviewType:
            interviewRequest.interviewType.toString() as InterviewType,
        });
        return interviewRequest;
      }
      return interviewRequest;
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async deleteInterviewRequest(id: number) {
    try {
      return await this.prisma.interviewRequest.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
