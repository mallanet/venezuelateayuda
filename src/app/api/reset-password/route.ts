import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { passwordResetSchema } from "@/lib/validation";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";

export async function POST(req: Request): Promise<NextResponse> {
  const json: unknown = await req.json().catch(() => null);
  const parsed = passwordResetSchema.safeParse(json);
  if (!parsed.success) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      parsed.error.issues[0]?.message ?? "Datos inválidos",
      400
    );
  }

  const { token, password } = parsed.data;
  const record = await prisma.verificationToken.findUnique({
    where: { token },
    select: { id: true, userId: true, purpose: true, expiresAt: true },
  });

  if (!record || record.purpose !== "PASSWORD_RESET" || record.expiresAt < new Date()) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      "El enlace no es válido o expiró. Solicita uno nuevo.",
      400
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        // Si nunca verificó, el reset por email cuenta como verificación.
        emailVerified: new Date(),
      },
    }),
    prisma.verificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return NextResponse.json({
    ok: true,
    message: "Contraseña actualizada. Ya puedes iniciar sesión.",
  });
}
