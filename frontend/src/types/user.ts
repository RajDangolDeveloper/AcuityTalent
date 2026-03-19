export enum Role {
  ADMIN = "ADMIN",
  RECRUITER = "RECRUITER",
  CANDIDATE = "CANDIDATE",
}
export interface UserResponseDto {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  role: Role;
  isOnboarded: boolean;
  createdAt: string; // Dates are sent as ISO strings over JSON
  updatedAt: string;
}
export interface CreateUserDto {
  email: string;
  password: string; // Plaintext on the way in
  firstName?: string;
  lastName?: string;
  contactPhone?: string;
  contactEmail?: string;
  role: Role;
  isOnboarded?: boolean;
}

export interface UpdateUserDto extends Partial<
  Omit<CreateUserDto, "password">
> {
  password?: string;
}
