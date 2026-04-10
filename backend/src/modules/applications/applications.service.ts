import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/config/email.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { GetApplicationsQueryDto } from './dto/get-applications-query.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { ApplicationStatus, JobStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { MatchScoreRequest } from '../ai/dto/matchingScoreRequest.dto';
import { CandidateService } from '../candidates/candidate.service';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private aiService: AiService,
    private candidateProfileService: CandidateService,
  ) {}

  async createApplication(
    createApplicationDto: CreateApplicationDto,
    userId: number,
  ): Promise<ApplicationResponseDto> {
    // Verify candidate exists
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new ForbiddenException('Only candidates can apply for jobs');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: createApplicationDto.jobId },
      include: { recruiter: { include: { company: true, user: true } } },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== JobStatus.ACTIVE) {
      throw new BadRequestException(
        'This job is no longer accepting applications',
      );
    }

    const resume = await this.prisma.resume.findUnique({
      where: { id: createApplicationDto.resumeId },
    });

    if (!resume || resume.candidateId !== candidate.id) {
      throw new NotFoundException('Resume not found or does not belong to you');
    }

    const existingApplication = await this.prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId: createApplicationDto.jobId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied for this job');
    }
    const matchScoreRequest = new MatchScoreRequest();
    var score;
    matchScoreRequest.jobContent = job.description + job.requirements;
    matchScoreRequest.resumeContent = resume.textContent || '';
    const matchScore = await this.aiService
      .getMatchingScore(matchScoreRequest)
      .subscribe({
        next: (response) => {
          score = response.score;
        },
        error: (err) => {
          console.error('something went wrong', err);
        },
      });

    const application = await this.prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId: createApplicationDto.jobId,
        resumeId: createApplicationDto.resumeId,
        coverLetter: createApplicationDto.coverLetter,
        matchScore: Number(score),
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date(),
      },
      include: {
        candidate: { include: { user: true } },
        job: { include: { recruiter: { include: { company: true } } } },
        resume: true,
      },
    });

    await this.sendApplicationNotificationEmail(
      application,
      job.recruiter.user.email,
    );

    return this.formatApplicationResponse(application);
  }

  async getApplicationsForRecruiter(
    userId: number,
    query: GetApplicationsQueryDto,
  ): Promise<{ data: ApplicationResponseDto[]; total: number }> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Only recruiters can view applications');
    }

    // Build filter
    const where: any = {
      job: {
        recruiterId: recruiter.id,
      },
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.jobId) {
      where.jobId = query.jobId;
    }

    const total = await this.prisma.application.count({ where });

    const applications = await this.prisma.application.findMany({
      where,
      include: {
        candidate: { include: { user: true } },
        job: { include: { recruiter: { include: { company: true } } } },
        resume: true,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { appliedAt: 'desc' },
    });

    return {
      data: applications.map((app) => this.formatApplicationResponse(app)),
      total,
    };
  }

  async getApplicationsForCandidate(
    userId: number,
    query: GetApplicationsQueryDto,
  ): Promise<{ data: ApplicationResponseDto[]; total: number }> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new ForbiddenException('No Candidate Found');
    }

    const where: any = {
      candidateId: candidate.id,
    };

    if (query.status) {
      where.status = query.status;
    }

    const total = await this.prisma.application.count({ where });

    const applications = await this.prisma.application.findMany({
      where,
      include: {
        candidate: { include: { user: true } },
        job: { include: { recruiter: { include: { company: true } } } },
        resume: true,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { appliedAt: 'desc' },
    });

    return {
      data: applications.map((app) => this.formatApplicationResponse(app)),
      total,
    };
  }

  async getApplicationById(
    applicationId: number,
  ): Promise<ApplicationResponseDto> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: { include: { user: true } },
        job: { include: { recruiter: { include: { company: true } } } },
        resume: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { id: application.job.recruiterId },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter not found');
    }

    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { id: application.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const isRecruiter =
      recruiter && recruiter.id === application.job.recruiterId;
    const isCandidate = candidate && candidate.id === application.candidateId;
    if (!isRecruiter && !isCandidate) {
      throw new ForbiddenException(
        'You do not have permission to view this application',
      );
    }

    const applicationUpdate = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'REVIEWED',
      },
      include: {
        candidate: {
          include: { user: true },
        },
        job: {
          include: {
            recruiter: {
              include: { company: true },
            },
          },
        },
        resume: true,
      },
    });

    return this.formatApplicationResponse(application);
  }

  async shortlistApplication(
    applicationId: number,
    userId: number,
  ): Promise<ApplicationResponseDto> {
    return this.updateApplicationStatus(
      applicationId,
      ApplicationStatus.SHORTLISTED,
      userId,
    );
  }

  async updateToInterviewing(
    applicationId: number,
    userId: number,
  ): Promise<ApplicationResponseDto> {
    return this.updateApplicationStatus(
      applicationId,
      ApplicationStatus.INTERVIEWING,
      userId,
    );
  }

  async acceptApplication(
    applicationId: number,
    userId: number,
  ): Promise<ApplicationResponseDto> {
    return this.updateApplicationStatus(
      applicationId,
      ApplicationStatus.OFFER_EXTENDED,
      userId,
    );
  }

  async rejectApplication(
    applicationId: number,
    userId: number,
  ): Promise<ApplicationResponseDto> {
    return this.updateApplicationStatus(
      applicationId,
      ApplicationStatus.REJECTED,
      userId,
    );
  }

  async acceptOffer(
    applicationId: number,
    userId: number,
  ): Promise<ApplicationResponseDto> {
    return this.updateApplicationStatus(
      applicationId,
      ApplicationStatus.ACCEPTED,
      userId,
    );
  }

  async withdrawApplication(
    applicationId: number,
    userId: number,
  ): Promise<ApplicationResponseDto> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { candidate: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.candidate.userId !== userId) {
      throw new ForbiddenException(
        'You can only withdraw your own applications',
      );
    }

    if (application.status === ApplicationStatus.ACCEPTED) {
      throw new BadRequestException('Cannot withdraw an accepted offer');
    }

    return this.updateApplicationStatus(
      applicationId,
      ApplicationStatus.WITHDRAWN,
      userId,
    );
  }

  private async updateApplicationStatus(
    applicationId: number,
    newStatus: ApplicationStatus,
    userId: number,
  ): Promise<ApplicationResponseDto> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: { include: { user: true } },
        job: {
          include: { recruiter: { include: { company: true, user: true } } },
        },
        resume: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    const isRecruiter =
      (recruiter && recruiter.id === application.job.recruiterId) || false;
    const isCandidate = candidate && candidate.id === application.candidateId;

    if (!isRecruiter && !isCandidate) {
      throw new ForbiddenException(
        'You do not have permission to update this application',
      );
    }

    this.validateStatusTransition(application.status, newStatus, isRecruiter);

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        reviewedAt:
          newStatus !== ApplicationStatus.APPLIED ? new Date() : undefined,
        updatedAt: new Date(),
      },
      include: {
        candidate: { include: { user: true } },
        job: {
          include: { recruiter: { include: { company: true, user: true } } },
        },
        resume: true,
      },
    });

    await this.handleStatusChangeNotifications(updatedApplication, newStatus);

    return this.formatApplicationResponse(updatedApplication);
  }

  private validateStatusTransition(
    currentStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
    isRecruiter: boolean,
  ): void {
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      APPLIED: [ApplicationStatus.REVIEWED, ApplicationStatus.REJECTED],
      REVIEWED: [ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED],
      SHORTLISTED: [ApplicationStatus.INTERVIEWING, ApplicationStatus.REJECTED],
      INTERVIEWING: [
        ApplicationStatus.OFFER_EXTENDED,
        ApplicationStatus.REJECTED,
      ],
      OFFER_EXTENDED: [ApplicationStatus.ACCEPTED],
      ACCEPTED: [],
      REJECTED: [],
      WITHDRAWN: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private async handleStatusChangeNotifications(
    application: any,
    newStatus: ApplicationStatus,
  ): Promise<void> {
    const candidateEmail = application.candidate.user.email;
    const jobTitle = application.job.title;
    const companyName = application.job.recruiter.company.name;

    try {
      switch (newStatus) {
        case ApplicationStatus.SHORTLISTED:
          await this.emailService.sendShortlistEmail({
            email: candidateEmail,
            jobTitle,
            companyName,
          });
          break;

        case ApplicationStatus.OFFER_EXTENDED:
          await this.emailService.sendOfferEmail({
            email: candidateEmail,
            jobTitle,
            companyName,
          });
          break;

        case ApplicationStatus.REJECTED:
          await this.emailService.sendRejectionEmail({
            email: candidateEmail,
            jobTitle,
            companyName,
          });
          break;
      }
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }
  }

  private async sendApplicationNotificationEmail(
    application: any,
    recruiterEmail: string,
  ): Promise<void> {
    try {
      await this.emailService.sendApplicationNotificationEmail({
        email: recruiterEmail,
        candidateName: `${application.candidate.user.firstName} ${application.candidate.user.lastName}`,
        jobTitle: application.job.title,
        candidateEmail: application.candidate.user.email,
      });
    } catch (error) {
      console.error('Failed to send application notification email:', error);
    }
  }

  private formatApplicationResponse(application: any): ApplicationResponseDto {
    return {
      id: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      resumeId: application.resumeId,
      status: application.status,
      coverLetter: application.coverLetter,
      matchScore: application.matchScore,
      appliedAt: application.appliedAt,
      reviewedAt: application.reviewedAt,
      updatedAt: application.updatedAt,
      candidateName: `${application.candidate.user.firstName} ${application.candidate.user.lastName}`,
      candidateEmail: application.candidate.user.email,
      jobTitle: application.job.title,
      companyName: application.job.recruiter.company.name,
      resumeFileName: application.resume.fileName,
    };
  }

  async getApplicationStats(userId: number): Promise<any> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Only recruiters can view stats');
    }

    const stats = await this.prisma.application.groupBy({
      by: ['status'],
      where: {
        job: {
          recruiterId: recruiter.id,
        },
      },
      _count: true,
    });

    return stats.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {});
  }

  async getCandidatesForJob(
    jobId: number,
    userId: number,
    query: GetApplicationsQueryDto,
  ): Promise<{ data: ApplicationResponseDto[]; total: number }> {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Only recruiters can view applications');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.recruiterId !== recruiter.id) {
      throw new ForbiddenException(
        'You do not have permission to view candidates for this job',
      );
    }

    const where: any = { jobId };
    if (query.status) {
      where.status = query.status;
    }

    const total = await this.prisma.application.count({ where });

    const applications = await this.prisma.application.findMany({
      where,
      include: {
        candidate: { include: { user: true } },
        job: { include: { recruiter: { include: { company: true } } } },
        resume: true,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { appliedAt: 'desc' },
    });

    return {
      data: applications.map((app) => this.formatApplicationResponse(app)),
      total,
    };
  }

  //Dashboard Functions
  async getResponseRate(id: number) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: {
        userId: id,
      },
    });

    if (!candidate) {
      return Error('Candidate Profile not found');
    }

    const respondedApplications = await this.prisma.application.count({
      where: {
        candidateId: candidate.id,
        status: {
          notIn: ['APPLIED', 'WITHDRAWN'],
        },
      },
    });
    const totalApplications = await this.prisma.application.count({
      where: {
        candidateId: candidate.id,
      },
    });

    const responseRate =
      ((respondedApplications ?? 0) /
        (totalApplications === 0 ? 1 : totalApplications)) *
      100;

    return responseRate;
  }

  async getUserTotalApplications(id: number) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: {
        userId: id,
      },
    });

    if (!candidate) {
      return Error('Candidate Profile not found');
    }

    const totalApplications = await this.prisma.application.count({
      where: {
        candidateId: candidate.id,
      },
    });
    return totalApplications;
  }

  async getInterviewRate(id: number) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: {
        userId: id,
      },
    });

    if (!candidate) {
      return Error('Candidate Profile not found');
    }

    const respondedApplications = await this.prisma.application.count({
      where: {
        candidateId: candidate.id,
        hadInterview: true,
      },
    });
    const totalApplications = await this.prisma.application.count({
      where: {
        candidateId: candidate.id,
      },
    });

    if (totalApplications === 0) {
      return 0;
    }

    const interviewRate = (respondedApplications / totalApplications) * 100;

    return Math.round(interviewRate * 100) / 100;
  }

  async getNumberOfOffers(id: number) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: {
        userId: id,
      },
    });

    if (!candidate) {
      return Error('Candidate Profile not found');
    }

    const jobOffers = await this.prisma.application.count({
      where: {
        status: 'OFFER_EXTENDED',
        candidateId: candidate.id,
      },
    });

    return jobOffers;
  }

  async getRecommendedJobs(id: number) {}

  async getRecentJobApplications(id: number) {
    const candidateProfile =
      await this.candidateProfileService.getCandidateProfileByUserId(id);

    const recentApplications = await this.prisma.application.findMany({
      orderBy: {
        appliedAt: 'desc',
      },
      where: {
        candidateId: candidateProfile.id,
      },
      take: 10,
      include: {
        job: true,
      },
    });

    return recentApplications;
  }

  async getUserActivity(id: number) {}
}
