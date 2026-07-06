import { NextResponse } from "next/server";
import type { Category, ListingType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-helpers";
import { listingSchema } from "@/lib/validation";
import { CATEGORIES } from "@/lib/categories";
import { getAvatarUrl } from "@/lib/avatar";

/** Lista pública de fichas aprobadas, con filtros por tipo, categoría, estado y búsqueda. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category");
  const state = url.searchParams.get("state");
  const q = url.searchParams.get("q")?.trim().toLowerCase();

  const where: Prisma.HelpListingWhereInput = { status: "APROBADA" };
  if (type === "OFREZCO" || type === "NECESITO") where.type = type as ListingType;
  if (category && CATEGORIES.includes(category as Category)) where.category = category as Category;
  if (state) where.state = state;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { municipality: { contains: q, mode: "insensitive" } },
      { user: { profile: { displayName: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const listings = await prisma.helpListing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      category: true,
      state: true,
      municipality: true,
      lat: true,
      lng: true,
      quantity: true,
      quantityUnit: true,
      modality: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          profile: { select: { displayName: true, avatarUrl: true, radiusKm: true } },
        },
      },
    },
  });

  return NextResponse.json({
    listings: listings.map((l) => {
      const displayName = l.user.profile?.displayName ?? "Anónimo";
      return {
        id: l.id,
        type: l.type,
        title: l.title,
        description: l.description,
        category: l.category,
        state: l.state,
        municipality: l.municipality,
        lat: l.lat,
        lng: l.lng,
        createdAt: l.createdAt,
        authorName: displayName.split(" ")[0],
        authorDisplayName: displayName,
        authorAvatarUrl: getAvatarUrl(displayName, l.user.profile?.avatarUrl, l.user.id),
        radiusKm: l.user.profile?.radiusKm ?? 10,
        quantity: l.quantity,
        quantityUnit: l.quantityUnit,
        modality: l.modality,
      };
    }),
  });
}

export async function POST(req: Request) {
  const { user, error } = await getSessionUser({ requireApproved: true });
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = listingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const listing = await prisma.helpListing.create({
    data: { ...parsed.data, userId: user.id },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
