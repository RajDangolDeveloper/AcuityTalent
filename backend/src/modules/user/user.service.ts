import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Role } from '@prisma/client';
import { PasswordService } from '../../config/password.service';
import { PrismaService } from '../../prisma/prisma.service';

const userSelectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  contactPhone: true,
  contactEmail: true,
  role: true,
  isOnboarded: true,
  subscriptionPlan: true,
  subscriptionExpiresAt: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async createUser(dto: CreateUserDto) {
    if (dto.role === Role.ADMIN) {
      throw new BadRequestException(
        'Use /users/admin endpoint to create ADMIN users',
      );
    }

    return this.createUserRecord(dto, dto.role);
  }

  async createAdminUser(dto: CreateUserDto) {
    return this.createUserRecord(dto, Role.ADMIN);
  }

  private async createUserRecord(dto: CreateUserDto, role: Role) {
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            contactPhone: dto.contactPhone,
            contactEmail: dto.contactEmail,
            role,
            isOnboarded: dto.isOnboarded ?? false,
          },
          select: userSelectFields,
        });

        if (role === Role.CANDIDATE) {
          const profileData = {};
          await tx.candidateProfile.create({
            data: {
              userId: user.id,
              ...profileData,
            },
          });
        }

        return user;
      });

      return result;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A user with this email already exists.');
      }
      throw error;
    }
  }

  async getUserById(id: number) {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id: id,
      },
      omit: {
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: userSelectFields,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: dto,
        select: userSelectFields,
      });

      return updatedUser;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      throw error;
    }
  }

  async updateProfilePicture(id: number, profilePictureUrl: string) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { profilePictureUrl },
        select: userSelectFields,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      throw error;
    }
  }

  async deleteUser(id: number) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
        select: userSelectFields,
      });

      return deletedUser;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      throw error;
    }
  }
}
