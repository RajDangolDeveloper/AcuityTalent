import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  IsNumber,
  IsEmail,
  IsUrl,
} from 'class-validator';
import { CompanySize, Industry } from '@prisma/client';

export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsNumber()
  ownerId!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  backgroundImgUrl?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsEmail()
  companyEmail!: string;

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
