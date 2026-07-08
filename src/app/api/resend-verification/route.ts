import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";

const schema = z.object({
  email: z.string().email("Email inválido"),
});

/** Reenvía el enlace de verificación. Respuesta genérica para no filtrar cuentas. */
export async function POST(req: Request): Promise<NextResponse> {
  const json: unknown = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      parsed.error.issues[0]?.message ?? "Email inválido",
      400
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (user && !user.emailVerified) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
      prisma.verificationToken.create({
        data: { token, userId: user.id, expiresAt },
      }),
    ]);
    try {
      await sendVerificationEmail(email, token);
    } catch (err) {
      console.error("[api/resend-verification]", err);
      return apiErrorResponse(
        ApiErrorCode.INTERNAL,
        "No se pudo enviar el email. Intenta de nuevo en unos minutos.",
        503
      );
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Si la cuenta existe y no está verificada, enviamos un nuevo enlace.",
  });
}
