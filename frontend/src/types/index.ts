export type ActiveUserDataType = {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  token: string;
};

export type LoginUserProps = {
  email: string;
  password: string;
};

export type RoleType = "SUPER_ADMIN" | "ADMIN" | "CANDIDATE" | "RECRUITER";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  data: T[];
  pagination: PaginationMeta;
}

export interface SingleResponse<T> {
  statusCode: number;
  data: T;
}
