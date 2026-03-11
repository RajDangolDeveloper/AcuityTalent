import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { CompanySize, Industry } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * DTO for querying companies with filters and pagination
 */
export class GetCompaniesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Industry)
  industry?: Industry;

  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}