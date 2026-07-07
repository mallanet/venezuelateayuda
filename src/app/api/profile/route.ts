import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-helpers";
import { profileSchema } from "@/lib/validation";
import { abroadMapPosition, isAbroadState } from "@/lib/abroad";
import { getState } from "@/lib/venezuela";
import { getAvatarUrl } from "@/lib/avatar";

export async function GET() {
  const { user, error } = await getSessionUser();
  if (error) return error;

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, role: true, status: true, emailVerified: true },
  });
  return NextResponse.json({ profile, user: dbUser });
}

export async function PUT(req: Request) {
  const { user, error } = await getSessionUser();
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const abroad = isAbroadState(data.state);
  const coords = abroad
    ? abroadMapPosition(user.id)
    : { lat: getState(data.state)?.lat ?? null, lng: getState(data.state)?.lng ?? null };

  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data: {
      displayName: data.displayName,
      avatarUrl: data.avatarUrl?.trim()
        ? data.avatarUrl.trim()
        : getAvatarUrl(data.displayName),
      phone: data.phone || null,
      bio: data.bio || null,
      state: data.state,
      municipality: data.municipality,
      lat: coords.lat,
      lng: coords.lng,
      radiusKm: abroad ? 0 : data.radiusKm,
      categories: data.categories,
    },
  });
  return NextResponse.json({ profile });
}
