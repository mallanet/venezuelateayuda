import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { emailOnlySchema } from "@/lib/validation";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";

/** Solicita reset de contraseña. Respuesta genérica para no filtrar cuentas. */
export async function POST(req: Request): Promise<NextResponse> {
  const json: unknown = await req.json().catch(() => null);
  const parsed = emailOnlySchema.safeParse(json);
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
    select: { id: true },
  });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({
        where: { userId: user.id, purpose: "PASSWORD_RESET" },
      }),
      prisma.verificationToken.create({
        data: { token, userId: user.id, purpose: "PASSWORD_RESET", expiresAt },
      }),
    ]);
    try {
      await sendPasswordResetEmail(email, token);
    } catch (err) {
      console.error("[api/forgot-password]", err);
      return apiErrorResponse(
        ApiErrorCode.INTERNAL,
        "No se pudo enviar el email. Intenta de nuevo en unos minutos.",
        503
      );
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Si la cuenta existe, enviamos un enlace para restablecer la contraseña.",
  });
}
