import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CandidateService } from '../candidates/candidate.service';
import { JobService } from '../jobs/job.service';
import { RecruiterService } from '../recruiters/recruiter.service';
import { createInterviewRequestDto } from './dto/createInterviewRequest.dto';
import { updateInterviewRequestDto } from './dto/updateInterviewRequest.dto';

@Injectable()
export class InterviewRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobService: JobService,
    private readonly candidateService: CandidateService,
    private readonly recruiterService: RecruiterService,
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
      });
    } catch (error: any) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  async createInterviewRequest(dto: createInterviewRequestDto) {
    const [findJob, findCandidate, findRecruiter] = await Promise.all([
      this.jobService.getJobById(dto.jobId),
      this.candidateService.getCandidateProfileById(dto.candidateId),
      this.recruiterService.getRecruiterProfileById(dto.recruiterId),
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
      throw new NotFoundException(
        `Recruiter with ID ${dto.recruiterId} was not found`,
      );
    }

    try {
      const interviewRequest = await this.prisma.interviewRequest.create({
        data: dto,
      });
      return interviewRequest;
    } catch (error) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  async updateInterviewRequest(dto: updateInterviewRequestDto) {
    try {
      const interviewRequest = await this.prisma.interviewRequest.update({
        data: dto,
        where: {
          id: dto.id,
        },
      });

      return interviewRequest;
    } catch (error) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
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
