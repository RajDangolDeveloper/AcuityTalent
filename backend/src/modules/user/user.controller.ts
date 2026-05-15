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
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { SpacesService } from '../spaces/spaces.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly spacesService: SpacesService,
  ) {}

  @Get('current')
  async getCurrentUsers(@Req() req) {
    const user = req.user.id;
    return await this.userService.getUserById(Number(user));
  }

  @Post('profile/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(@Req() req: any, @UploadedFile() file: any) {
    if (!file) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No file uploaded',
      };
    }

    const imagePath = await this.spacesService.uploadProfileImage(file);
    const imageUrl = this.spacesService.getPublicUrl(imagePath);
    const user = await this.userService.updateProfilePicture(
      req.user.id,
      imageUrl,
    );

    return {
      statusCode: HttpStatus.OK,
      data: user,
    };
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
