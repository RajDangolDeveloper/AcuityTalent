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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/CreateCompanyDto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { GetCompaniesQueryDto } from './dto/get-companies-query.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyNameResponseDto } from './dto/company-name-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpacesService } from '../spaces/spaces.service';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(
    private companyService: CompanyService,
    private spacesService: SpacesService,
  ) {}

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

  @Post(':id/upload/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCompanyLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No file uploaded',
      };
    }

    const logoPath = await this.spacesService.uploadCompanyLogo(file);
    const logoUrl = this.spacesService.getPublicUrl(logoPath);
    const company = await this.companyService.updateCompany(parseInt(id), {
      logoUrl,
    });

    return {
      statusCode: HttpStatus.OK,
      data: company,
    };
  }

  @Post(':id/upload/background')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCompanyBackground(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No file uploaded',
      };
    }

    const backgroundPath =
      await this.spacesService.uploadCompanyBackground(file);
    const backgroundImgUrl = this.spacesService.getPublicUrl(backgroundPath);
    const company = await this.companyService.updateCompany(parseInt(id), {
      backgroundImgUrl,
    });

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
