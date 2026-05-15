import NextAuth from "next-auth";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import apiClient from "../../api-client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      isOnboarded: boolean;
    } & DefaultSession["user"];
    accessToken?: string;
  }
  interface User {
    role: string;
    access_token?: string;
    isOnboarded: boolean;
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
            return null;
          }

          const userData = response.data;

          return {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            isOnboarded: userData.isOnboarded,
            access_token: userData.access_token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.access_token;
        token.role = user.role;
        token.isOnboarded = user.isOnboarded;
      }

      if (trigger === "update" && token.id) {
        try {
          const response = await apiClient.get("/users/current", {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          });
          const freshUser = response.data.data || response.data;
          if (freshUser) {
            token.isOnboarded = freshUser.isOnboarded;
          }
        } catch (e) {
          console.error("Update failed:", e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
        session.user.isOnboarded = token.isOnboarded as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 23 * 60 * 60,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
