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
  UseGuards,
  Req,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { GetCompaniesQueryDto } from './dto/get-companies-query.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyNameResponseDto } from './dto/company-name-response.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCompany(
    @Req() req,
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<{ statusCode: number; data: CompanyResponseDto }> {
    createCompanyDto.ownerId = req.user.id;
    const company = await this.companyService.createCompany(createCompanyDto);

    return {
      statusCode: HttpStatus.CREATED,
      data: company,
    };
  }

  @Get('names')
  async getAllCompaniesNames(@Query() query: GetCompaniesQueryDto): Promise<{
    statusCode: number;
    data: CompanyNameResponseDto[];
  }> {
    const { data } = await this.companyService.getAllCompaniesNames(query);

    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

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

  @Get('recruiter')
  async getCompanyByUser(
    @Req() req,
  ): Promise<{ statusCode: number; data: CompanyResponseDto }> {
    const company = await this.companyService.getRecruiterCompany(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      data: company,
    };
  }

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCompany(@Param('id') id: string): Promise<void> {
    await this.companyService.deleteCompany(parseInt(id));
  }
}
