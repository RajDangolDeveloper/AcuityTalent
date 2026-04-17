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
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname, join } from 'path';

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

  @Post(':id/upload/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'companyProfile');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`,
          );
        },
      }),
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

    const logoUrl = `/uploads/companyProfile/${file.filename}`;
    const company = await this.companyService.updateCompany(parseInt(id), {
      logoUrl,
    });

    return {
      statusCode: HttpStatus.OK,
      data: company,
    };
  }

  @Post(':id/upload/background')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(
            process.cwd(),
            'uploads',
            'companyBackground',
          );
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`,
          );
        },
      }),
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

    const backgroundImgUrl = `/uploads/companyBackground/${file.filename}`;
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
