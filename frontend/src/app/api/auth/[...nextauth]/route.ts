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
    accessToken?: string;
  }
  interface User {
    role: string;
    access_token?: string;
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
          const response = await apiClient.post("/auth/login", user);

          if (response.status !== 200 && response.status !== 201) {
            console.warn(
              "Login API returned non-success status:",
              response.status,
            );
            return null;
          }

          const userData = response.data;

          return {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            access_token: userData.access_token,
          };
        } catch (error) {
          console.error("Login API failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
