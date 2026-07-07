import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/email";
import { abroadMapPosition, isAbroadState } from "@/lib/abroad";
import { getState } from "@/lib/venezuela";
import { getAvatarUrl } from "@/lib/avatar";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const abroad = isAbroadState(data.state);
  const coords = abroad
    ? abroadMapPosition(email)
    : { lat: getState(data.state)?.lat ?? null, lng: getState(data.state)?.lng ?? null };

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: data.role,
      termsAcceptedAt: new Date(),
      profile: {
        create: {
          displayName: data.displayName,
          avatarUrl: getAvatarUrl(data.displayName),
          phone: data.phone || null,
          state: data.state,
          municipality: data.municipality,
          lat: coords.lat,
          lng: coords.lng,
        },
      },
    },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  await sendVerificationEmail(email, token);

  return NextResponse.json({ ok: true }, { status: 201 });
}
