import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as bcrypt from 'bcrypt';

// 1. LOAD ENV FIRST (Strictly before any other imports)
dotenv.config({ path: resolve(process.cwd(), '.env') });

// 2. LOG FOR DEBUGGING (To see if it's actually working)
console.log('--- Environment Check ---');
console.log('DATABASE_URL found:', process.env.DATABASE_URL ? '✅' : '❌');
console.log(
  'PASSWORD_SECRET found:',
  process.env.PASSWORD_SECRET ? '✅' : '❌',
);

// 3. NOW IMPORT PRISMA
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

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL || !process.env.PASSWORD_SECRET) {
    throw new Error('Missing environment variables. Seed aborted.');
  }

  console.log('--- Starting Seed Process ---');

  const hashPassword = async (password: string) => {
    const pepper = process.env.PASSWORD_SECRET;
    const saltRounds = 10;
    return await bcrypt.hash(password + pepper, saltRounds);
  };

  const commonPassword = await hashPassword('Password123!');

  // 1. Create a Company
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Acuity Tech',
      ownerId: 1,
      companyEmail: 'hr@acuitytech.com',
      industry: Industry.TECHNOLOGY,
      companySize: CompanySize.FIFTY_ONE_TO_TWO_HUNDRED,
      description: 'Leading AI Recruitment Solutions.',
      websiteUrl: 'https://acuity.ai',
    },
  });

  // 2. Create a Recruiter User
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@acuitytech.com' },
    update: {},
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

  // 3. Create a Candidate User
  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {},
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

  // 4. Create a Job
  const job = await prisma.job.upsert({
    where: { id: 1 },
    update: {},
    create: {
      companyId: company.id,
      recruiterId: recruiterUser.recruiter!.id,
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

  // 5. Create a Resume
  const resume = await prisma.resume.create({
    data: {
      candidateId: candidateUser.candidate!.id,
      fileName: 'John_Doe_CV.pdf',
      filePath: 's3://bucket/resumes/john_doe.pdf',
      fileType: FileType.PDF,
      fileSize: 102400,
      aiScore: 85,
      textContent: 'Full stack developer with 5 years experience...',
    },
  });

  // 6. Create an Application
  const application = await prisma.application.create({
    data: {
      candidateId: candidateUser.candidate!.id,
      jobId: job.id,
      resumeId: resume.id,
      status: ApplicationStatus.REVIEWED,
      matchScore: 88.5,
      coverLetter: 'I am very interested in this Prisma-related role.',
    },
  });

  // 7. Create an Interview
  await prisma.interview.create({
    data: {
      applicationId: application.id,
      interviewerId: recruiterUser.recruiter!.id,
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
            candidateProfileId: candidateUser.candidate!.id,
          },
        ],
      },
    },
  });

  // 8. Saved Job
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

  console.log('✅ Seeding Completed Successfully');
  console.log('--- Login Credentials ---');
  console.log('Email: candidate@example.com');
  console.log('Password: Password123!');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
