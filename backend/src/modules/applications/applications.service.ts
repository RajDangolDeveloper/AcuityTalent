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
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { GetApplicationsQueryDto } from './dto/get-applications-query.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { ApplicationStatus, Role, JobStatus } from '@prisma/client';

/**
 * ApplicationService - Handles all application-related business logic
 * Covers: Application creation, status updates, querying, and notifications
 * Maps to sequence diagram steps: 11, 13-31
 */
@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Step 11: Candidate submits job application
   * Creates a new application record and checks for duplicates
   */
  async createApplication(
    createApplicationDto: CreateApplicationDto,
    userId: number,
  ): Promise<ApplicationResponseDto> {
    // Verify candidate exists
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!candidate) {
      throw new ForbiddenException('Only candidates can apply for jobs');
    }

    // Verify job exists and is active
    const job = await this.prisma.job.findUnique({
      where: { id: createApplicationDto.jobId },
      include: { recruiter: { include: { company: true, user: true } } },
    });

    console.log(job);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== JobStatus.ACTIVE) {
      throw new BadRequestException(
        'This job is no longer accepting applications',
      );
    }

    // Verify resume exists and belongs to candidate
    const resume = await this.prisma.resume.findUnique({
      where: { id: createApplicationDto.resumeId },
    });

    if (!resume || resume.candidateId !== candidate.id) {
      throw new NotFoundException('Resume not found or does not belong to you');
    }

    // Check for duplicate application
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

    // Create application
    const application = await this.prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId: createApplicationDto.jobId,
        resumeId: createApplicationDto.resumeId,
        coverLetter: createApplicationDto.coverLetter,
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date(),
      },
      include: {
        candidate: { include: { user: true } },
        job: { include: { recruiter: { include: { company: true } } } },
        resume: true,
      },
    });

    // Step 12: Notification - New applicant notifies recruiter
    // Send email to recruiter about new application
    await this.sendApplicationNotificationEmail(
      application,
      job.recruiter.user.email,
    );

    return this.formatApplicationResponse(application);
  }

  /**
   * Step 13-14: Recruiter retrieves all applications for their jobs
   * With filtering, pagination, and sorting
   */
  async getApplicationsForRecruiter(
    userId: number,
    query: GetApplicationsQueryDto,
  ): Promise<{ data: ApplicationResponseDto[]; total: number }> {
    // Verify recruiter
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

    // Get total count
    const total = await this.prisma.application.count({ where });

    // Get paginated results
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

  /**
   * Step 8-12: Candidate retrieves their own applications
   * Shows job search page and their application history
   */
  async getApplicationsForCandidate(
    userId: number,
    query: GetApplicationsQueryDto,
  ): Promise<{ data: ApplicationResponseDto[]; total: number }> {
    // Verify candidate
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new ForbiddenException(
        'Only candidates can view their applications',
      );
    }

    // Build filter
    const where: any = {
      candidateId: candidate.id,
    };

    if (query.status) {
      where.status = query.status;
    }

    // Get total count
    const total = await this.prisma.application.count({ where });

    // Get paginated results
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

  /**
   * Get single application details
   * Used by both recruiter and candidate
   */
  async getApplicationById(
    applicationId: number,
    userId: number,
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

    // Verify authorization - candidate or recruiter of the job
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    const isRecruiter =
      recruiter && recruiter.id === application.job.recruiterId;
    const isCandidate = candidate && candidate.id === application.candidateId;

    if (!isRecruiter && !isCandidate) {
      throw new ForbiddenException(
        'You do not have permission to view this application',
      );
    }

    return this.formatApplicationResponse(application);
  }

  /**
   * Step 16: Recruiter shortlists candidate
   * Updates application status and sends shortlist email
   */
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

  /**
   * Step 20-21: Interview process
   * Updates application to interviewing status
   */
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

  /**
   * Step 22: Accept candidate (Offer extended)
   * Updates application status and sends offer email
   */
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

  /**
   * Step 25 & 28: Reject candidate
   * Updates application status and sends rejection email
   */
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

  /**
   * Candidate accepts offer
   * Updates application status to accepted
   */
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

  /**
   * Candidate withdraws application
   * Can only withdraw before accepted
   */
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

  /**
   * Internal: Update application status with validation
   */
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

    // Verify authorization
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

    // Validate status transitions
    this.validateStatusTransition(application.status, newStatus, isRecruiter);

    // Update application
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

    // Send notification emails based on status change
    await this.handleStatusChangeNotifications(updatedApplication, newStatus);

    return this.formatApplicationResponse(updatedApplication);
  }

  /**
   * Validate status transitions (FSM)
   */
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

  /**
   * Send appropriate email notifications based on status
   */
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
          // Step 18: Send shortlist email
          await this.emailService.sendShortlistEmail({
            email: candidateEmail,
            jobTitle,
            companyName,
          });
          break;

        case ApplicationStatus.OFFER_EXTENDED:
          // Step 23: Send hiring email
          await this.emailService.sendOfferEmail({
            email: candidateEmail,
            jobTitle,
            companyName,
          });
          break;

        case ApplicationStatus.REJECTED:
          // Steps 26, 30: Send rejection email
          await this.emailService.sendRejectionEmail({
            email: candidateEmail,
            jobTitle,
            companyName,
          });
          break;
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to send notification email:', error);
    }
  }

  /**
   * Send notification to recruiter about new application
   */
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

  /**
   * Format application for API response
   */
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

  /**
   * Get application statistics for recruiter dashboard
   */
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

  /**
   * Get candidates for a specific job (recruiter view)
   */
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
}
