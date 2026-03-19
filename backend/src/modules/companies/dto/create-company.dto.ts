import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { CompanySize, Industry } from '@prisma/client';

export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsNumber()
  ownerId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @IsOptional()
  @IsEnum(Industry)
  industry?: Industry;

  @IsOptional()
  @IsString()
  officeAddress?: string;
}
