export interface Company {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  backgroundImgUrl: string | null;
  websiteUrl: string | null;
  companySize: CompanySize | null;
  industry: Industry | null;
  officeAddress: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum CompanySize {
  ONE_TO_TEN = "ONE_TO_TEN",
  ELEVEN_TO_FIFTY = "ELEVEN_TO_FIFTY",
  FIFTY_ONE_TO_TWO_HUNDRED = "FIFTY_ONE_TO_TWO_HUNDRED",
  TWO_HUNDRED_ONE_TO_FIVE_HUNDRED = "TWO_HUNDRED_ONE_TO_FIVE_HUNDRED",
  FIVE_HUNDRED_ONE_TO_THOUSAND = "FIVE_HUNDRED_ONE_TO_THOUSAND",
  THOUSAND_PLUS = "THOUSAND_PLUS",
}

export enum Industry {
  TECHNOLOGY = "TECHNOLOGY",
  HEALTHCARE = "HEALTHCARE",
  FINANCE = "FINANCE",
  EDUCATION = "EDUCATION",
  RETAIL = "RETAIL",
  MANUFACTURING = "MANUFACTURING",
  CONSULTING = "CONSULTING",
  REAL_ESTATE = "REAL_ESTATE",
  ENTERTAINMENT = "ENTERTAINMENT",
  HOSPITALITY = "HOSPITALITY",
  CONSTRUCTION = "CONSTRUCTION",
  TRANSPORTATION = "TRANSPORTATION",
  ENERGY = "ENERGY",
  TELECOMMUNICATIONS = "TELECOMMUNICATIONS",
  MARKETING = "MARKETING",
  NON_PROFIT = "NON_PROFIT",
  GOVERNMENT = "GOVERNMENT",
  OTHER = "OTHER",
}

export interface CreateCompanyDto {
  ownerId: number;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  backgroundImgUrl?: string | null;
  websiteUrl?: string | null;
  companySize?: CompanySize | null;
  industry?: Industry | null;
  officeAddress?: string | null;
  isVerified?: boolean;
}

export interface UpdateCompanyDto {
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  backgroundImgUrl?: string | null;
  websiteUrl?: string | null;
  companySize?: CompanySize | null;
  industry?: Industry | null;
  officeAddress?: string | null;
  isVerified?: boolean;
}

export interface CompanyResponseDto {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  backgroundImgUrl: string | null;
  websiteUrl: string | null;
  companySize: CompanySize | null;
  industry: Industry | null;
  officeAddress: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
