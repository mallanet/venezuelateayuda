import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { isEmailDeliveryConfigured, sendVerificationEmail } from "@/lib/email";
import { getZoneCoords } from "@/lib/venezuela";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";

function newVerifyToken() {
  return {
    token: crypto.randomBytes(32).toString("hex"),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

async function sendVerificationOrFail(
  email: string,
  token: string,
  opts?: { rollbackUserId?: string }
): Promise<NextResponse | null> {
  try {
    const { sent } = await sendVerificationEmail(email, token);
    if (!sent && isEmailDeliveryConfigured()) {
      if (opts?.rollbackUserId) {
        await prisma.user.delete({ where: { id: opts.rollbackUserId } }).catch(() => undefined);
      }
      return apiErrorResponse(
        ApiErrorCode.INTERNAL,
        "No se pudo enviar el email de verificación. Intenta de nuevo en unos minutos.",
        503
      );
    }
  } catch (err) {
    console.error("[api/register] email failed", err);
    if (isEmailDeliveryConfigured()) {
      if (opts?.rollbackUserId) {
        await prisma.user.delete({ where: { id: opts.rollbackUserId } }).catch(() => undefined);
      }
      return apiErrorResponse(
        ApiErrorCode.INTERNAL,
        "No se pudo enviar el email de verificación. Intenta de nuevo en unos minutos.",
        503
      );
    }
  }
  return null;
}

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
  const passwordHash = await bcrypt.hash(data.password, 12);
  const coords = getZoneCoords(data.state, data.municipality, email);
  const profileData = {
    displayName: data.displayName,
    avatarUrl: null as string | null,
    phone: data.phone || null,
    state: data.state,
    municipality: data.municipality,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  };

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  // Cuenta huérfana (nunca verificó): actualizar datos y reenviar verificación.
  if (existing && !existing.emailVerified) {
    try {
      const { token, expiresAt } = newVerifyToken();
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: existing.id },
          data: {
            passwordHash,
            role: data.role,
            termsAcceptedAt: new Date(),
          },
        });
        await tx.profile.upsert({
          where: { userId: existing.id },
          create: { userId: existing.id, ...profileData },
          update: profileData,
        });
        await tx.verificationToken.deleteMany({
          where: { userId: existing.id, purpose: "EMAIL_VERIFY" },
        });
        await tx.verificationToken.create({
          data: {
            token,
            userId: existing.id,
            purpose: "EMAIL_VERIFY",
            expiresAt,
          },
        });
      });
      const fail = await sendVerificationOrFail(email, token);
      if (fail) return fail;
      return NextResponse.json(
        {
          ok: true,
          message: "Reenviamos el email de verificación. Revisa tu bandeja.",
          resent: true,
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("[api/register] reclaim failed", err);
      return apiErrorResponse(
        ApiErrorCode.INTERNAL,
        "No se pudo actualizar la cuenta. Intenta de nuevo.",
        500
      );
    }
  }

  if (existing) {
    return apiErrorResponse(ApiErrorCode.CONFLICT, "Ya existe una cuenta con ese email", 409);
  }

  const { token, expiresAt } = newVerifyToken();
  let userId: string;
  try {
    userId = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: data.role,
          termsAcceptedAt: new Date(),
          profile: { create: profileData },
        },
      });
      await tx.verificationToken.create({
        data: {
          token,
          userId: created.id,
          purpose: "EMAIL_VERIFY",
          expiresAt,
        },
      });
      return created.id;
    });
  } catch (err) {
    console.error("[api/register] create failed", err);
    return apiErrorResponse(
      ApiErrorCode.INTERNAL,
      "No se pudo crear la cuenta. Intenta de nuevo.",
      500
    );
  }

  const fail = await sendVerificationOrFail(email, token, { rollbackUserId: userId });
  if (fail) return fail;

  return NextResponse.json({ ok: true }, { status: 201 });
}
