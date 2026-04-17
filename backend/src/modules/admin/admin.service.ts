import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private getPage(query: AdminListQueryDto): number {
    return query.page ?? 1;
  }

  private getLimit(query: AdminListQueryDto): number {
    return query.limit ?? 20;
  }

  private getSkip(query: AdminListQueryDto): number {
    return (this.getPage(query) - 1) * this.getLimit(query);
  }

  async getOverview() {
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      totalApplications,
      totalInterviews,
      totalResumes,
      totalSavedJobs,
      totalCandidateEmbeddings,
      totalJobEmbeddings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.candidateProfile.count(),
      this.prisma.recruiterProfile.count(),
      this.prisma.company.count(),
      this.prisma.job.count(),
      this.prisma.application.count(),
      this.prisma.interview.count(),
      this.prisma.resume.count(),
      this.prisma.savedJob.count(),
      this.prisma.candidateProfileEmbedding.count(),
      this.prisma.jobEmbedding.count(),
    ]);

    return {
      users: totalUsers,
      candidates: totalCandidates,
      recruiters: totalRecruiters,
      companies: totalCompanies,
      jobs: totalJobs,
      applications: totalApplications,
      interviews: totalInterviews,
      resumes: totalResumes,
      savedJobs: totalSavedJobs,
      candidateEmbeddings: totalCandidateEmbeddings,
      jobEmbeddings: totalJobEmbeddings,
    };
  }

  async listUsers(query: AdminListQueryDto) {
    const where = query.search
      ? {
          OR: [
            { email: { contains: query.search, mode: 'insensitive' as const } },
            {
              firstName: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
            {
              lastName: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        omit: { passwordHash: true },
        include: {
          candidate: true,
          recruiter: { include: { company: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: this.getSkip(query),
        take: this.getLimit(query),
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page: this.getPage(query),
      limit: this.getLimit(query),
    };
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
      include: {
        candidate: {
          include: {
            resumes: true,
            applications: true,
            workHistory: true,
            education: true,
            savedJobs: true,
          },
        },
        recruiter: {
          include: {
            company: true,
            jobs: true,
            interviewsConducted: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async listCandidates(query: AdminListQueryDto) {
    const where = query.search
      ? {
          OR: [
            {
              user: {
                email: { contains: query.search, mode: 'insensitive' as const },
              },
            },
            {
              currentPosition: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
            {
              user: {
                firstName: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            },
            {
              user: {
                lastName: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.candidateProfile.findMany({
        where,
        include: {
          user: { omit: { passwordHash: true } },
          currentCompany: true,
          embedding: true,
          _count: {
            select: {
              resumes: true,
              applications: true,
              workHistory: true,
              education: true,
              savedJobs: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: this.getSkip(query),
        take: this.getLimit(query),
      }),
      this.prisma.candidateProfile.count({ where }),
    ]);

    return {
      data,
      total,
      page: this.getPage(query),
      limit: this.getLimit(query),
    };
  }

  async getCandidateById(id: number) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { id },
      include: {
        user: { omit: { passwordHash: true } },
        currentCompany: true,
        resumes: true,
        applications: {
          include: { job: true, resume: true, interviews: true },
        },
        workHistory: true,
        education: true,
        savedJobs: { include: { job: true } },
        embedding: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async listRecruiters(query: AdminListQueryDto) {
    const where = query.search
      ? {
          OR: [
            {
              user: {
                email: { contains: query.search, mode: 'insensitive' as const },
              },
            },
            {
              positionTitle: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
            {
              company: {
                name: { contains: query.search, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.recruiterProfile.findMany({
        where,
        include: {
          user: { omit: { passwordHash: true } },
          company: true,
          _count: {
            select: {
              jobs: true,
              interviewsConducted: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: this.getSkip(query),
        take: this.getLimit(query),
      }),
      this.prisma.recruiterProfile.count({ where }),
    ]);

    return {
      data,
      total,
      page: this.getPage(query),
      limit: this.getLimit(query),
    };
  }

  async getRecruiterById(id: number) {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { id },
      include: {
        user: { omit: { passwordHash: true } },
        company: true,
        jobs: { include: { applications: true } },
        interviewsConducted: true,
      },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter not found');
    }

    return recruiter;
  }

  async listCompanies(query: AdminListQueryDto) {
    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            {
              companyEmail: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
            {
              officeAddress: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: {
          recruiters: { include: { user: { omit: { passwordHash: true } } } },
          employees: {
            include: { user: { omit: { passwordHash: true } } },
          },
          _count: {
            select: {
              jobs: true,
              recruiters: true,
              employees: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: this.getSkip(query),
        take: this.getLimit(query),
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data,
      total,
      page: this.getPage(query),
      limit: this.getLimit(query),
    };
  }

  async getCompanyById(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        recruiters: { include: { user: { omit: { passwordHash: true } } } },
        employees: { include: { user: { omit: { passwordHash: true } } } },
        jobs: {
          include: {
            recruiter: { include: { user: { omit: { passwordHash: true } } } },
            applications: true,
            savedBy: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async listJobs(query: AdminListQueryDto) {
    const where = query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' as const } },
            {
              description: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
            {
              company: {
                name: { contains: query.search, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          company: true,
          recruiter: { include: { user: { omit: { passwordHash: true } } } },
          embedding: true,
          _count: {
            select: {
              applications: true,
              savedBy: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: this.getSkip(query),
        take: this.getLimit(query),
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data,
      total,
      page: this.getPage(query),
      limit: this.getLimit(query),
    };
  }

  async getJobById(id: number) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        recruiter: { include: { user: { omit: { passwordHash: true } } } },
        applications: {
          include: {
            candidate: { include: { user: { omit: { passwordHash: true } } } },
            resume: true,
            interviews: true,
          },
        },
        embedding: true,
        savedBy: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async listApplications(query: AdminListQueryDto) {
    const where = query.search
      ? {
          OR: [
            {
              job: {
                title: { contains: query.search, mode: 'insensitive' as const },
              },
            },
            {
              candidate: {
                user: {
                  email: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          candidate: { include: { user: { omit: { passwordHash: true } } } },
          job: {
            include: {
              company: true,
              recruiter: {
                include: { user: { omit: { passwordHash: true } } },
              },
            },
          },
          resume: true,
          interviews: true,
        },
        orderBy: { appliedAt: 'desc' },
        skip: this.getSkip(query),
        take: this.getLimit(query),
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data,
      total,
      page: this.getPage(query),
      limit: this.getLimit(query),
    };
  }

  async getApplicationById(id: number) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: { include: { user: { omit: { passwordHash: true } } } },
        job: {
          include: {
            company: true,
            recruiter: { include: { user: { omit: { passwordHash: true } } } },
          },
        },
        resume: true,
        interviews: {
          include: {
            participants: {
              include: { user: { omit: { passwordHash: true } } },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async listInterviews(query: AdminListQueryDto) {
    const where = query.search
      ? {
          OR: [
            {
              application: {
                job: {
                  title: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
              },
            },
            {
              roomId: { contains: query.search, mode: 'insensitive' as const },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        include: {
          application: {
            include: {
              candidate: {
                include: { user: { omit: { passwordHash: true } } },
              },
              job: {
                include: {
                  company: true,
                  recruiter: {
                    include: { user: { omit: { passwordHash: true } } },
                  },
                },
              },
            },
          },
          interviewer: { include: { user: { omit: { passwordHash: true } } } },
          participants: {
            include: {
              user: { omit: { passwordHash: true } },
              candidateProfile: true,
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        skip: this.getSkip(query),
        take: this.getLimit(query),
      }),
      this.prisma.interview.count({ where }),
    ]);

    return {
      data,
      total,
      page: this.getPage(query),
      limit: this.getLimit(query),
    };
  }

  async getInterviewById(id: number) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: { include: { user: { omit: { passwordHash: true } } } },
            job: {
              include: {
                company: true,
                recruiter: {
                  include: { user: { omit: { passwordHash: true } } },
                },
              },
            },
          },
        },
        interviewer: { include: { user: { omit: { passwordHash: true } } } },
        participants: {
          include: {
            user: { omit: { passwordHash: true } },
            candidateProfile: true,
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async listResumes(query: AdminListQueryDto) {
    const where = query.search
      ? {
          OR: [
            {
              fileName: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
            {
              candidate: {
                user: {
                  email: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.resume.findMany({
        where,
        include: {
          candidate: { include: { user: { omit: { passwordHash: true } } } },
          applications: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: this.getSkip(query),
        take: this.getLimit(query),
      }),
      this.prisma.resume.count({ where }),
    ]);

    return {
      data,
      total,
      page: this.getPage(query),
      limit: this.getLimit(query),
    };
  }

  async getResumeById(id: number) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      include: {
        candidate: { include: { user: { omit: { passwordHash: true } } } },
        applications: {
          include: {
            job: true,
            interviews: true,
          },
        },
      },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  async listSavedJobs(query: AdminListQueryDto) {
    const where = query.search
      ? {
          OR: [
            {
              job: {
                title: { contains: query.search, mode: 'insensitive' as const },
              },
            },
            {
              candidate: {
                user: {
                  email: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.savedJob.findMany({
        where,
        include: {
          candidate: { include: { user: { omit: { passwordHash: true } } } },
          job: {
            include: {
              company: true,
              recruiter: {
                include: { user: { omit: { passwordHash: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: this.getSkip(query),
        take: this.getLimit(query),
      }),
      this.prisma.savedJob.count({ where }),
    ]);

    return {
      data,
      total,
      page: this.getPage(query),
      limit: this.getLimit(query),
    };
  }

  async getSavedJobById(id: number) {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: { id },
      include: {
        candidate: { include: { user: { omit: { passwordHash: true } } } },
        job: {
          include: {
            company: true,
            recruiter: { include: { user: { omit: { passwordHash: true } } } },
          },
        },
      },
    });

    if (!savedJob) {
      throw new NotFoundException('Saved job not found');
    }

    return savedJob;
  }

  async listEmbeddings(query: AdminListQueryDto) {
    const [candidateEmbeddings, jobEmbeddings, totalCandidate, totalJobs] =
      await Promise.all([
        this.prisma.candidateProfileEmbedding.findMany({
          include: {
            candidateProfile: {
              include: { user: { omit: { passwordHash: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: this.getSkip(query),
          take: this.getLimit(query),
        }),
        this.prisma.jobEmbedding.findMany({
          include: {
            job: {
              include: {
                company: true,
                recruiter: {
                  include: { user: { omit: { passwordHash: true } } },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: this.getSkip(query),
          take: this.getLimit(query),
        }),
        this.prisma.candidateProfileEmbedding.count(),
        this.prisma.jobEmbedding.count(),
      ]);

    return {
      candidateEmbeddings,
      jobEmbeddings,
      totalCandidate,
      totalJobs,
      page: this.getPage(query),
      limit: this.getLimit(query),
    };
  }
}
