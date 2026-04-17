import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname, join } from 'path';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('current')
  async getCurrentUsers(@Req() req) {
    const user = req.user.id;
    return await this.userService.getUserById(Number(user));
  }

  @Post('profile/upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'userProfile');
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
  async uploadProfileImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No file uploaded',
      };
    }

    const imageUrl = `/uploads/userProfile/${file.filename}`;
    const user = await this.userService.updateProfilePicture(
      req.user.id,
      imageUrl,
    );

    return {
      statusCode: HttpStatus.OK,
      data: user,
    };
  }

  @Get('subscription/status')
  async getSubscriptionStatus(@Req() req: any) {
    return this.userService.getSubscriptionStatus(req.user.id);
  }

  @Post('subscription/esewa/initiate')
  async initiateEsewaPayment(@Req() req: any) {
    return this.userService.initiateEsewaPayment(req.user.id);
  }

  @Get('subscription/esewa/success')
  async completeEsewaPayment(
    @Req() req: any,
    @Query('tx') tx: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const result = await this.userService.completeEsewaPayment(req.user.id, tx);
    const status = result.success ? 'success' : 'failed';

    return res.redirect(
      `${frontendUrl}/plans?payment=${status}${tx ? `&tx=${tx}` : ''}`,
    );
  }

  @Get('all')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createAdminUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createAdminUser(createUserDto);
  }

  @Get(':id')
  async getUserById(@Param() id: number) {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
