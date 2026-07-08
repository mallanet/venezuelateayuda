import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login?verified=error`);
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (
    !record ||
    record.purpose !== "EMAIL_VERIFY" ||
    record.expiresAt < new Date()
  ) {
    return NextResponse.redirect(`${appUrl}/login?verified=expired`);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.deleteMany({
      where: { userId: record.userId, purpose: "EMAIL_VERIFY" },
    }),
  ]);

  return NextResponse.redirect(`${appUrl}/login?verified=ok`);
}
