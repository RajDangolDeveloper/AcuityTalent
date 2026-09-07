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
import { UploadFileDto } from '../spaces/dto/upload-file.dto';
import { UploadType } from '../spaces/types/types';

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
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
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

    const dto = Object.assign(new UploadFileDto(), {
      fileName: file.filename || file.originalname,
      fileType: 'image/jpeg',
      uploadType: UploadType.CompanyProfile,
      id: Number(id),
    });

    const logoPath = await this.spacesService.uploadPublicFile(file, dto);
    const company = await this.companyService.updateCompany(parseInt(id), {
      logoUrl: logoPath,
    });

    return {
      statusCode: HttpStatus.OK,
      data: company,
    };
  }

  @Post(':id/upload/background')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
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

    const dto = Object.assign(new UploadFileDto(), {
      fileName: file.filename || file.originalname,
      fileType: 'image/jpeg',
      uploadType: UploadType.CompanyBackground,
      id: Number(id),
    });

    const backgroundPath = await this.spacesService.uploadPublicFile(file, dto);
    const company = await this.companyService.updateCompany(parseInt(id), {
      backgroundImgUrl: backgroundPath,
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
