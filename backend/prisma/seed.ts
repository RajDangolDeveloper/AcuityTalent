import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';


dotenv.config({ path: resolve(process.cwd(), '.env') });


import {
  PrismaClient,
  Role,
  Industry,
  CompanySize,
  EmploymentType,
  ExperienceLevel,
  LocationType,
  JobStatus,
  EducationLevel,
  ApplicationStatus,
  InterviewType,
  InterviewStatus,
  FileType,
  ParticipantRole,
  ParticipantStatus,
} from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DATABASE_URL || !process.env.PASSWORD_SECRET) {
    throw new Error('Missing environment variables. Seed aborted.');
  }

  const hashPassword = async (password: string) => {
    const pepper = process.env.PASSWORD_SECRET;
    const saltRounds = 10;
    return await bcrypt.hash(password + pepper, saltRounds);
  };

  const commonPassword = await hashPassword('Password123!');

  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acuitytech.com' },
    update: {
      passwordHash: commonPassword,
      role: Role.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      isOnboarded: true,
      isVerified: true,
    },
    create: {
      email: 'admin@acuitytech.com',
      passwordHash: commonPassword,
      role: Role.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      isOnboarded: true,
      isVerified: true,
    },
  });

  
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {
      ownerId: adminUser.id,
      name: 'Acuity Tech',
      companyEmail: 'hr@acuitytech.com',
      industry: Industry.TECHNOLOGY,
      companySize: CompanySize.FIFTY_ONE_TO_TWO_HUNDRED,
      description: 'Leading AI Recruitment Solutions.',
      websiteUrl: 'https://acuity.ai',
    },
    create: {
      name: 'Acuity Tech',
      ownerId: adminUser.id,
      companyEmail: 'hr@acuitytech.com',
      industry: Industry.TECHNOLOGY,
      companySize: CompanySize.FIFTY_ONE_TO_TWO_HUNDRED,
      description: 'Leading AI Recruitment Solutions.',
      websiteUrl: 'https://acuity.ai',
    },
  });

  
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@acuitytech.com' },
    update: {
      passwordHash: commonPassword,
      role: Role.RECRUITER,
      firstName: 'Jane',
      lastName: 'Smith',
      isOnboarded: true,
      isVerified: true,
    },
    create: {
      email: 'recruiter@acuitytech.com',
      passwordHash: commonPassword,
      role: Role.RECRUITER,
      firstName: 'Jane',
      lastName: 'Smith',
      isOnboarded: true,
      isVerified: true,
      recruiter: {
        create: {
          companyId: company.id,
          positionTitle: 'Senior Talent Acquisition',
        },
      },
    },
    include: { recruiter: true },
  });

  const recruiterProfile = await prisma.recruiterProfile.upsert({
    where: { userId: recruiterUser.id },
    update: {
      companyId: company.id,
      positionTitle: 'Senior Talent Acquisition',
    },
    create: {
      userId: recruiterUser.id,
      companyId: company.id,
      positionTitle: 'Senior Talent Acquisition',
    },
  });

  
  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {
      passwordHash: commonPassword,
      role: Role.CANDIDATE,
      firstName: 'John',
      lastName: 'Doe',
      isOnboarded: true,
      isVerified: true,
    },
    create: {
      email: 'candidate@example.com',
      passwordHash: commonPassword,
      role: Role.CANDIDATE,
      firstName: 'John',
      lastName: 'Doe',
      isOnboarded: true,
      isVerified: true,
      candidate: {
        create: {
          headline: 'Full Stack Developer',
          experienceYears: 5,
          skills: ['Node.js', 'React', 'TypeScript', 'Prisma'],
          highestDegree: EducationLevel.BACHELOR,
          preferredJobType: EmploymentType.FULL_TIME,
          workHistory: {
            create: {
              company: 'PrevTech',
              position: 'Junior Dev',
              startDate: new Date('2020-01-01'),
              endDate: new Date('2022-01-01'),
              description: 'Worked on web apps.',
            },
          },
          education: {
            create: {
              institution: 'Tech University',
              degree: EducationLevel.BACHELOR,
              fieldOfStudy: 'Computer Science',
              startDate: new Date('2016-01-01'),
              endDate: new Date('2020-01-01'),
            },
          },
        },
      },
    },
    include: { candidate: true },
  });

  const candidateProfile = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {
      headline: 'Full Stack Developer',
      experienceYears: 5,
      skills: ['Node.js', 'React', 'TypeScript', 'Prisma'],
      highestDegree: EducationLevel.BACHELOR,
      preferredJobType: EmploymentType.FULL_TIME,
    },
    create: {
      userId: candidateUser.id,
      headline: 'Full Stack Developer',
      experienceYears: 5,
      skills: ['Node.js', 'React', 'TypeScript', 'Prisma'],
      highestDegree: EducationLevel.BACHELOR,
      preferredJobType: EmploymentType.FULL_TIME,
      workHistory: {
        create: {
          company: 'PrevTech',
          position: 'Junior Dev',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2022-01-01'),
          description: 'Worked on web apps.',
        },
      },
      education: {
        create: {
          institution: 'Tech University',
          degree: EducationLevel.BACHELOR,
          fieldOfStudy: 'Computer Science',
          startDate: new Date('2016-01-01'),
          endDate: new Date('2020-01-01'),
        },
      },
    },
  });

  
  const job = await prisma.job.upsert({
    where: { id: 1 },
    update: {
      companyId: company.id,
      recruiterId: recruiterProfile.id,
      title: 'Senior Software Engineer',
      description: 'Looking for a Prisma expert.',
      requirements: '5+ years experience, TypeScript proficiency.',
      employmentType: EmploymentType.FULL_TIME,
      experienceLevel: ExperienceLevel.SENIOR,
      location: 'Remote',
      locationType: LocationType.REMOTE,
      status: JobStatus.ACTIVE,
      postedDate: new Date(),
    },
    create: {
      companyId: company.id,
      recruiterId: recruiterProfile.id,
      title: 'Senior Software Engineer',
      description: 'Looking for a Prisma expert.',
      requirements: '5+ years experience, TypeScript proficiency.',
      employmentType: EmploymentType.FULL_TIME,
      experienceLevel: ExperienceLevel.SENIOR,
      location: 'Remote',
      locationType: LocationType.REMOTE,
      status: JobStatus.ACTIVE,
      postedDate: new Date(),
    },
  });

  
  const resume =
    (await prisma.resume.findFirst({
      where: { candidateId: candidateProfile.id },
    })) ||
    (await prisma.resume.create({
      data: {
        candidateId: candidateProfile.id,
        fileName: 'John_Doe_CV.pdf',
        filePath: 's3://bucket/resumes/john_doe.pdf',
        fileType: FileType.PDF,
        fileSize: 102400,
        aiScore: 85,
        textContent: 'Full stack developer with 5 years experience...',
      },
    }));

  
  const application =
    (await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidateProfile.id,
          jobId: job.id,
        },
      },
    })) ||
    (await prisma.application.create({
      data: {
        candidateId: candidateProfile.id,
        jobId: job.id,
        resumeId: resume.id,
        status: ApplicationStatus.REVIEWED,
        matchScore: 88.5,
        coverLetter: 'I am very interested in this Prisma-related role.',
      },
    }));

  
  const existingInterview = await prisma.interview.findFirst({
    where: { applicationId: application.id },
  });

  if (!existingInterview) {
    await prisma.interview.create({
      data: {
        applicationId: application.id,
        interviewerId: recruiterProfile.id,
        roomId: `room-${Math.random().toString(36).substring(7)}`,
        interviewType: InterviewType.TECHNICAL,
        status: InterviewStatus.SCHEDULED,
        scheduledAt: new Date(Date.now() + 86400000),
        meetingLink: 'https://zoom.us/j/123456789',
        participants: {
          create: [
            {
              userId: recruiterUser.id,
              role: ParticipantRole.INTERVIEWER,
              status: ParticipantStatus.WAITING,
            },
            {
              userId: candidateUser.id,
              role: ParticipantRole.CANDIDATE,
              status: ParticipantStatus.WAITING,
              candidateProfileId: candidateProfile.id,
            },
          ],
        },
      },
    });
  }

  
  await prisma.savedJob.upsert({
    where: {
      candidateId_jobId: {
        candidateId: candidateUser.candidate!.id,
        jobId: job.id,
      },
    },
    update: {},
    create: {
      candidateId: candidateUser.candidate!.id,
      jobId: job.id,
    },
  });
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
