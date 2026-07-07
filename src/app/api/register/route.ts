import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/email";
import { abroadMapPosition, isAbroadState } from "@/lib/abroad";
import { getState } from "@/lib/venezuela";
import { getAvatarUrl } from "@/lib/avatar";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";

export async function POST(req: Request): Promise<NextResponse> {
  const json: unknown = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      parsed.error.issues[0]?.message ?? "Datos inválidos",
      400
    );
  }

  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return apiErrorResponse(ApiErrorCode.CONFLICT, "Ya existe una cuenta con ese email", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const abroad = isAbroadState(data.state);
  const coords = abroad
    ? abroadMapPosition(email)
    : { lat: getState(data.state)?.lat ?? null, lng: getState(data.state)?.lng ?? null };
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: data.role,
        termsAcceptedAt: new Date(),
        profile: {
          create: {
            displayName: data.displayName,
            avatarUrl: getAvatarUrl(data.displayName, undefined, email),
            phone: data.phone || null,
            state: data.state,
            municipality: data.municipality,
            lat: coords.lat,
            lng: coords.lng,
          },
        },
      },
    });
    await tx.verificationToken.create({
      data: { token, userId: created.id, expiresAt },
    });
    return created;
  });

  await sendVerificationEmail(email, token);

  return NextResponse.json({ ok: true }, { status: 201 });
}
