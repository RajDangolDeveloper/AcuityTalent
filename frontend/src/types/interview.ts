export enum InterviewType {
  SCREENING = "SCREENING",
  TECHNICAL = "TECHNICAL",
  FINAL = "FINAL",
  HR = "HR",
  SYSTEM_DESIGN = "SYSTEM_DESIGN",
}

export enum InterviewStatus {
  PENDING = "PENDING",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  RESCHEDULED = "RESCHEDULED",
  NO_SHOW = "NO_SHOW",
}

export interface Interview {
  id: number;
  interviewerId: number;
  applicationId: number;
  roomId: string;
  interviewType: InterviewType;
  status: InterviewStatus;
  scheduledAt: string;
  notes?: string;
  meetingLink?: string;
  actualStartAt?: string;
  actualEndAt?: string;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
  application: {
    id: number;
    candidateId: number;
    status?: string;
    job: {
      title: string;
    };
    candidate: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
  interviewer: {
    firstName?: string;
    lastName?: string;
    name?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
  participants?: Array<{
    id: number;
    userId: number;
    role: string;
    status: string;
  }>;
}

export interface CreateInterviewDto {
  applicationId: number;
  interviewerId: number;
  interviewType: InterviewType;
  scheduledAt: string;
  meetingLink?: string;
  notes?: string;
}
