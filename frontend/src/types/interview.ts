export enum InterviewType {
  SCREENING = "SCREENING",
  TECHNICAL = "TECHNICAL",
  FINAL = "FINAL",
  HR = "HR",
  SYSTEM_DESIGN = "SYSTEM_DESIGN",
}

export enum InterviewStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export interface Interview {
  id: number;
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
    firstName: string;
    lastName: string;
  };
}