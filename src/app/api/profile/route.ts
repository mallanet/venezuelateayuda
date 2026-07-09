import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session-guards";
import { profileSchema } from "@/lib/validation";
import { isAbroadState } from "@/lib/abroad";
import { getZoneCoords } from "@/lib/venezuela";
import { isCustomAvatarUrl } from "@/lib/avatar";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";

export async function GET(): Promise<NextResponse> {
  const { user, error } = await getSessionUser();
  if (error) return error;

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, role: true, status: true, emailVerified: true },
  });
  return NextResponse.json({ profile, user: dbUser });
}

export async function PUT(req: Request): Promise<NextResponse> {
  const { user, error } = await getSessionUser();
  if (error) return error;

  const json: unknown = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(json);
  if (!parsed.success) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      parsed.error.issues[0]?.message ?? "Datos inválidos",
      400
    );
  }

  const data = parsed.data;
  const abroad = isAbroadState(data.state);
  const coords = getZoneCoords(data.state, data.municipality, user.id);

  const nextAvatar = data.avatarUrl?.trim() ?? "";
  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data: {
      displayName: data.displayName,
      ...(nextAvatar
        ? isCustomAvatarUrl(nextAvatar)
          ? { avatarUrl: nextAvatar }
          : {}
        : {}),
      phone: data.phone || null,
      bio: data.bio || null,
      state: data.state,
      municipality: data.municipality,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      radiusKm: abroad ? 0 : data.radiusKm,
      categories: data.categories,
    },
  });
  return NextResponse.json({ profile });
}
