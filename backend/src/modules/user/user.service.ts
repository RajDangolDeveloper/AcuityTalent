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
  createdAt: true,
  updatedAt: true,
};

type SubscriptionStatusRow = {
  subscriptionPlan: 'NON_PREMIUM' | 'PREMIUM';
  coverLetterGenerationCount: number;
  subscriptionExpiresAt: Date | null;
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
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: id,
      },
      omit: {
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
        isOnboarded: true,
      },
    });

    const subscriptionStatus = await this.getSubscriptionStatus(id);

    return {
      ...user,
      subscriptionPlan: subscriptionStatus.plan,
      isPremium: subscriptionStatus.isPremium,
    };
  }

  async getSubscriptionStatus(userId: number) {
    const rows = await this.prisma.$queryRaw<SubscriptionStatusRow[]>`
      SELECT
        "subscriptionPlan",
        "coverLetterGenerationCount",
        "subscriptionExpiresAt"
      FROM "User"
      WHERE id = ${userId}
      LIMIT 1
    `;

    const row = rows[0];
    if (!row) {
      throw new NotFoundException('User not found');
    }

    const isPremiumActive =
      row.subscriptionPlan === 'PREMIUM' &&
      (!!row.subscriptionExpiresAt
        ? row.subscriptionExpiresAt.getTime() > Date.now()
        : false);

    return {
      plan: isPremiumActive ? 'PREMIUM' : 'NON_PREMIUM',
      isPremium: isPremiumActive,
      coverLetterGenerationsUsed: row.coverLetterGenerationCount ?? 0,
      coverLetterLimit: isPremiumActive ? null : 2,
      pricePerMonth: 800,
      expiresAt: row.subscriptionExpiresAt,
    };
  }

  async initiateEsewaPayment(userId: number) {
    const tx = `esewa_${userId}_${Date.now()}`;
    const amount = 800;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const esewaBaseUrl =
      process.env.ESEWA_BASE_URL || 'https://uat.esewa.com.np/epay/main?';

    await this.prisma.$executeRaw`
      INSERT INTO "SubscriptionPayment" (
        "userId",
        "amount",
        "provider",
        "status",
        "transactionRef",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${userId},
        ${amount},
        ${'ESEWA'},
        ${'PENDING'}::"PaymentStatus",
        ${tx},
        NOW(),
        NOW()
      )
    `;

    const successUrl = `${backendUrl}/api/users/subscription/esewa/success?tx=${tx}`;
    const failureUrl = `${backendUrl}/api/users/subscription/esewa/success?tx=${tx}&failed=true`;

    const params = new URLSearchParams({
      amt: String(amount),
      psc: '0',
      pdc: '0',
      txAmt: '0',
      tAmt: String(amount),
      pid: tx,
      scd: process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST',
      su: successUrl,
      fu: failureUrl,
    });

    return {
      paymentUrl: `${esewaBaseUrl}${params.toString()}`,
      amount,
      transactionRef: tx,
    };
  }

  async completeEsewaPayment(userId: number, tx: string) {
    if (!tx) {
      return { success: false };
    }

    await this.prisma.$executeRaw`
      UPDATE "SubscriptionPayment"
      SET "status" = ${'COMPLETED'}::"PaymentStatus", "updatedAt" = NOW()
      WHERE "transactionRef" = ${tx} AND "userId" = ${userId}
    `;

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.$executeRaw`
      UPDATE "User"
      SET
        "subscriptionPlan" = ${'PREMIUM'}::"SubscriptionPlan",
        "subscriptionExpiresAt" = ${expiresAt},
        "coverLetterGenerationCount" = 0,
        "updatedAt" = NOW()
      WHERE id = ${userId}
    `;

    return { success: true };
  }

  async canGenerateAiCoverLetter(userId: number) {
    const status = await this.getSubscriptionStatus(userId);
    const remaining =
      status.coverLetterLimit === null
        ? Number.POSITIVE_INFINITY
        : status.coverLetterLimit - status.coverLetterGenerationsUsed;

    return {
      allowed: status.isPremium || remaining > 0,
      remaining: status.isPremium ? null : Math.max(remaining, 0),
      isPremium: status.isPremium,
    };
  }

  async incrementCoverLetterGeneration(userId: number) {
    await this.prisma.$executeRaw`
      UPDATE "User"
      SET "coverLetterGenerationCount" = "coverLetterGenerationCount" + 1,
          "updatedAt" = NOW()
      WHERE id = ${userId}
    `;
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
        select: userSelectFields, // Reusing our safe selection object
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
