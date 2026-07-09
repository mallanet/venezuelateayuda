import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session-guards";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";
import {
  UPLOAD_MAX_BYTES,
  UPLOAD_MIME,
  avatarPublicPath,
  uploadsRoot,
} from "@/lib/uploads";

export const runtime = "nodejs";

/** Sube foto de perfil (jpg/png/webp ≤ 2 MB) y actualiza avatarUrl. */
export async function POST(req: Request): Promise<NextResponse> {
  const { user, error } = await getSessionUser();
  if (error) return error;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return apiErrorResponse(ApiErrorCode.VALIDATION, "Formulario inválido", 400);
  }

  const file = form.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return apiErrorResponse(ApiErrorCode.VALIDATION, "Selecciona una imagen", 400);
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return apiErrorResponse(ApiErrorCode.VALIDATION, "La imagen no puede superar 2 MB", 400);
  }
  const ext = UPLOAD_MIME[file.type];
  if (!ext) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      "Formato no permitido. Usa JPG, PNG o WebP",
      400
    );
  }

  const dir = uploadsRoot();
  await mkdir(dir, { recursive: true });

  const filename = `${user.id}.${ext}`;
  const absolute = path.join(dir, filename);
  const publicUrl = avatarPublicPath(user.id, ext);

  for (const oldExt of Object.values(UPLOAD_MIME)) {
    if (oldExt === ext) continue;
    await unlink(path.join(dir, `${user.id}.${oldExt}`)).catch(() => undefined);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolute, buffer);

  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data: { avatarUrl: publicUrl },
    select: { avatarUrl: true },
  });

  return NextResponse.json({ ok: true, avatarUrl: profile.avatarUrl });
}

/** Quita la foto y vuelve al placeholder de iniciales. */
export async function DELETE(): Promise<NextResponse> {
  const { user, error } = await getSessionUser();
  if (error) return error;

  const dir = uploadsRoot();
  for (const ext of Object.values(UPLOAD_MIME)) {
    await unlink(path.join(dir, `${user.id}.${ext}`)).catch(() => undefined);
  }

  await prisma.profile.update({
    where: { userId: user.id },
    data: { avatarUrl: null },
  });

  return NextResponse.json({ ok: true });
}
