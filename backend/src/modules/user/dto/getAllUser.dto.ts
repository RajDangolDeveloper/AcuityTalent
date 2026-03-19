import { Role } from '@prisma/client';

export class UserResponseDto {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  role: Role;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}
