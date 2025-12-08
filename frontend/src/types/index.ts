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
