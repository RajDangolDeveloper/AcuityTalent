import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { GetCompaniesQueryDto } from './dto/get-companies-query.dto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CompanyNameResponseDto } from './dto/company-name-response.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async createCompany(
    createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    try {
      const company = await this.prisma.company.create({
        data: createCompanyDto,
      });
      return company;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Company with this name already exists');
      }
      throw error;
    }
  }

  async getAllCompaniesNames(query: GetCompaniesQueryDto): Promise<{
    data: CompanyNameResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      total,
      page,
      pageSize: limit,
    };
  }

  async getCompanyByOwnerId(query): Promise<{
    data: CompanyResponseDto;
  }> {
    const company = await this.prisma.company.findFirstOrThrow({
      where: { ownerId: query.id },
    });

    return {
      data: company,
    };
  }

  async getRecruiterCompany(id: number) {
    const profile = await this.prisma.recruiterProfile.findUnique({
      where: { userId: id },
      include: { company: true },
    });

    if (!profile) throw new NotFoundException();

    return profile.company;
  }

  async getAllCompanies(query: GetCompaniesQueryDto): Promise<{
    data: CompanyResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { search, industry, companySize, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (industry) {
      where.industry = industry;
    }

    if (companySize) {
      where.companySize = companySize;
    }

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      total,
      page,
      pageSize: limit,
    };
  }

  async getCompanyById(id: number): Promise<CompanyResponseDto> {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async updateCompany(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    try {
      const company = await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto,
      });
      return company;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Company not found');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Company with this name already exists');
      }
      throw error;
    }
  }

  async deleteCompany(id: number): Promise<void> {
    try {
      await this.prisma.company.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Company not found');
      }
      throw error;
    }
  }
}
