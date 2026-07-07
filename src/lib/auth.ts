import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role, UserStatus } from "@prisma/client";

interface AuthJwt extends JWT {
  id?: string;
  role?: Role;
  status?: UserStatus;
}

function isRole(value: unknown): value is Role {
  return value === "AYUDANTE" || value === "SOLICITANTE" || value === "ADMIN";
}

function isUserStatus(value: unknown): value is UserStatus {
  return (
    value === "PENDIENTE" ||
    value === "APROBADO" ||
    value === "RECHAZADO" ||
    value === "SUSPENDIDO"
  );
}

function toAuthJwt(token: JWT): AuthJwt {
  return token as AuthJwt;
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
      const authToken = toAuthJwt(token);
      if (user) {
        authToken.id = user.id;
        authToken.role = user.role;
        authToken.status = user.status;
        return authToken;
      }
      if (typeof authToken.id === "string") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: authToken.id },
            select: { role: true, status: true },
          });
          if (dbUser) {
            authToken.role = dbUser.role;
            authToken.status = dbUser.status;
          } else {
            authToken.id = undefined;
            authToken.role = undefined;
            authToken.status = undefined;
          }
        } catch {
          // DB unavailable — keep existing token
        }
      }
      return authToken;
    },
    async session({ session, token }) {
      const authToken = toAuthJwt(token);
      if (
        session.user &&
        typeof authToken.id === "string" &&
        isRole(authToken.role) &&
        isUserStatus(authToken.status)
      ) {
        session.user.id = authToken.id;
        session.user.role = authToken.role;
        session.user.status = authToken.status;
      }
      return session;
    },
  },
});
