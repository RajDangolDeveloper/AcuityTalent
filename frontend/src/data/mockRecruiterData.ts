


import type { Job, CandidateApplication } from "@/src/types/recruiter";

export const mockJobs: Job[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    companyName: "Acme Tech",
    location: "San Francisco, CA",
    employmentType: "FULL_TIME",
    salaryMin: 120,
    salaryMax: 150,
    description:
      "Build high-quality web experiences using React and TypeScript.",
    requirements: ["React", "TypeScript", "Next.js"],
    applicationCount: 8,
    status: "ACTIVE",
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2025-10-02T10:00:00Z",
  },
  {
    id: 2,
    title: "Backend Engineer",
    companyName: "Beta Systems",
    location: "Remote",
    employmentType: "CONTRACT",
    salaryMin: 90,
    salaryMax: 120,
    description: "Work on services and APIs with Node.js and Postgres.",
    requirements: ["Node.js", "Postgres", "Prisma"],
    applicationCount: 5,
    status: "ACTIVE",
    createdAt: "2025-09-20T09:00:00Z",
    updatedAt: "2025-09-25T12:00:00Z",
  },
  {
    id: 3,
    title: "Product Designer",
    companyName: "DesignCo",
    location: "New York, NY",
    employmentType: "FULL_TIME",
    salaryMin: 80,
    salaryMax: 110,
    description: "Design beautiful and usable interfaces.",
    requirements: ["Figma", "UX"],
    applicationCount: 3,
    status: "DRAFT",
    createdAt: "2025-11-01T08:00:00Z",
    updatedAt: "2025-11-02T08:00:00Z",
  },
  {
    id: 4,
    title: "Data Scientist",
    companyName: "Analytics Lab",
    location: "Austin, TX",
    employmentType: "FULL_TIME",
    salaryMin: 110,
    salaryMax: 140,
    description: "Build models and insights from data.",
    requirements: ["Python", "ML", "Pandas"],
    applicationCount: 6,
    status: "ACTIVE",
    createdAt: "2025-08-15T10:00:00Z",
    updatedAt: "2025-08-20T14:00:00Z",
  },
];

export const mockCandidates: CandidateApplication[] = [
  {
    id: 101,
    candidateId: 1001,
    candidateName: "Alex Johnson",
    candidateEmail: "alex.j@email.com",
    location: "San Francisco, CA",
    phone: "+1 (555) 123-4567",
    profileImage: "",
    yearsOfExperience: 5,
    status: "APPLIED",
    matchScore: 90,
    appliedAt: "2025-10-11T09:00:00Z",
    
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  } as any,
  {
    id: 102,
    candidateId: 1002,
    candidateName: "Jamie Park",
    candidateEmail: "jamie.park@example.com",
    location: "San Jose, CA",
    phone: "+1 (555) 987-6543",
    profileImage: "",
    yearsOfExperience: 3,
    status: "APPLIED",
    matchScore: 78,
    appliedAt: "2025-10-08T11:30:00Z",
    videoUrl: "",
  } as any,
  {
    id: 103,
    candidateId: 1003,
    candidateName: "Maria Gomez",
    candidateEmail: "maria.gomez@example.com",
    location: "Remote",
    phone: "+1 (555) 222-3333",
    profileImage: "",
    yearsOfExperience: 7,
    status: "SHORTLISTED",
    matchScore: 85.5,
    appliedAt: "2025-09-30T08:20:00Z",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  } as any,
  {
    id: 104,
    candidateId: 1004,
    candidateName: "Daniel Lee",
    candidateEmail: "daniel.lee@example.com",
    location: "Austin, TX",
    phone: "+1 (555) 444-5555",
    profileImage: "",
    yearsOfExperience: 2,
    status: "APPLIED",
    matchScore: 62,
    appliedAt: "2025-10-12T14:10:00Z",
    videoUrl: "",
  } as any,
];




export function getMockCandidatesForJob(jobId: number): CandidateApplication[] {
  
  const results: CandidateApplication[] = [];
  for (let i = 0; i < (Math.abs(jobId) % 4) + 1; i++) {
    const source = mockCandidates[(jobId + i) % mockCandidates.length];
    
    results.push({
      ...source,
      id: source.id + jobId * 10,
      appliedAt: source.appliedAt,
    });
  }
  return results;
}

export default {
  mockJobs,
  mockCandidates,
  getMockCandidatesForJob,
};
