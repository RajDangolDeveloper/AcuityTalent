export declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      isOnboarded: boolean;
    } & DefaultSession["user"];
    accessToken?: string;
    expiresIn?: number;
  }
  interface User {
    role: string;
    access_token?: string;
    expiresIn: number;
    isOnboarded: boolean;
  }
}
