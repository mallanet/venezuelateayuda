import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role, UserStatus } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    status: UserStatus;
    emailVerified: Date | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      status: UserStatus;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    status?: UserStatus;
  }
}

export const { handlers, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      } else if (typeof token.id === "string") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, status: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.status = dbUser.status;
          } else {
            token.id = undefined;
            token.role = undefined;
            token.status = undefined;
            return token;
          }
        } catch {
          // DB unavailable — keep existing token
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === "string" && token.role && token.status) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
      }
      return session;
    },
  },
});
