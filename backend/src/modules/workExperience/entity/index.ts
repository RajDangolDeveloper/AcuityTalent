export class CandidateWorkExperienceResponseDto {
  id!: number;
  candidateId!: number;
  company!: string;
  position!: string;
  startDate!: Date;
  endDate?: Date | null;
  isCurrent!: boolean;
  description?: string | null;
  createdAt!: Date;
}

export class RecruiterWorkExperienceResponseDto {
  id!: number;
  recruiterId!: number;
  company!: string;
  position!: string;
  startDate!: Date;
  endDate?: Date | null;
  isCurrent!: boolean;
  description?: string | null;
  createdAt!: Date;
}
