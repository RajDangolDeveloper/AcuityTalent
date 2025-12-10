import NextAuth from "next-auth";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import apiClient from "../../api-client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User {
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "test@example.com",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = {
          email: credentials.email,
          password: credentials.password,
        };

        try {
          const response = apiClient.post("/auth/login", user);

          if (
            (await response).status !== 200 &&
            (await response).status !== 201
          ) {
            console.warn(
              "Login API returned non-success status:",
              (await response).status
            );
            return null;
          }

          const userData = (await response).data;

          return {
            id: userData.id,
            email: userData.email,
            role: userData.role,
          };
        } catch (error) {
          console.error("Login API failed:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
