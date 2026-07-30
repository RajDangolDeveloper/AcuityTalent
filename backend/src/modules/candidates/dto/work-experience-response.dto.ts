export class WorkExperienceResponseDto {
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
