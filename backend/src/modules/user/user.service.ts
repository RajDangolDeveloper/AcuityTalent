import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { PasswordService } from 'src/config/password.service';

const userSelectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  contactPhone: true,
  contactEmail: true,
  role: true,
  isOnboarded: true,
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
            role: dto.role,
            isOnboarded: dto.isOnboarded ?? false,
          },
          select: userSelectFields,
        });

        if (dto.role === 'CANDIDATE') {
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
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('A user with this email already exists.');
      }
      throw error;
    }
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
    } catch (error) {
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
        select: userSelectFields, // Reusing our safe selection object
      });

      return deletedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      throw error;
    }
  }
}
