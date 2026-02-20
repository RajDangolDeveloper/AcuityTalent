import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { GetCompaniesQueryDto } from './dto/get-companies-query.dto';
import { CompanyResponseDto } from './dto/company-response.dto';

/**
 * CompanyController - RESTful API endpoints for company management
 */
@Controller('companies')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  /**
   * POST /companies
   * Creates a new company
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<{ statusCode: number; data: CompanyResponseDto }> {
    const company = await this.companyService.createCompany(createCompanyDto);

    return {
      statusCode: HttpStatus.CREATED,
      data: company,
    };
  }

  /**
   * GET /companies
   * Get all companies with filters and pagination
   */
  @Get()
  async getAllCompanies(@Query() query: GetCompaniesQueryDto): Promise<{
    statusCode: number;
    data: CompanyResponseDto[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const { data, total, page, pageSize } =
      await this.companyService.getAllCompanies(query);

    return {
      statusCode: HttpStatus.OK,
      data,
      pagination: {
        total,
        page,
        limit: pageSize,
      },
    };
  }

  /**
   * GET /companies/:id
   * Get single company details
   */
  @Get(':id')
  async getCompanyById(
    @Param('id') id: string,
  ): Promise<{ statusCode: number; data: CompanyResponseDto }> {
    const company = await this.companyService.getCompanyById(parseInt(id));

    return {
      statusCode: HttpStatus.OK,
      data: company,
    };
  }

  /**
   * PATCH /companies/:id
   * Update company details
   */
  @Patch(':id')
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<{ statusCode: number; data: CompanyResponseDto }> {
    const company = await this.companyService.updateCompany(
      parseInt(id),
      updateCompanyDto,
    );

    return {
      statusCode: HttpStatus.OK,
      data: company,
    };
  }

  /**
   * DELETE /companies/:id
   * Delete a company
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCompany(@Param('id') id: string): Promise<void> {
    await this.companyService.deleteCompany(parseInt(id));
  }
}