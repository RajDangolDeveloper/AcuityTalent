import { CompanySize, Industry } from '@prisma/client';

/**
 * DTO for company response
 */
export class CompanyResponseDto {
  id: number;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  companySize?: CompanySize | null;
  industry?: Industry | null;
  officeAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
