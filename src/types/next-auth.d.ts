import type { Role, UserStatus } from "@prisma/client";
import type { DefaultSession } from "next-auth";

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
    } & DefaultSession["user"];
  }
}
