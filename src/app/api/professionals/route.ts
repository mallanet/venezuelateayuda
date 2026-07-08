import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { getAvatarUrl } from "@/lib/avatar";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";
import { parseSearchParams, professionalsQuerySchema } from "@/lib/validation";

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const parsed = parseSearchParams(professionalsQuerySchema, url.searchParams);
  if (!parsed.success) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      parsed.error.issues[0]?.message ?? "Filtros inválidos",
      400
    );
  }

  const { category, state, q } = parsed.data;
  const listingFilter: Prisma.HelpListingWhereInput = { status: "APROBADA" };
  if (category) listingFilter.category = category;
  if (state) listingFilter.state = state;

  const profileWhere: Prisma.ProfileWhereInput = {};
  if (q) {
    const qLower = q.toLowerCase();
    const categoryMatches = CATEGORIES.filter((c) =>
      CATEGORY_LABELS[c].toLowerCase().includes(qLower)
    );
    profileWhere.OR = [
      { displayName: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
      ...categoryMatches.map((c) => ({ categories: { has: c } })),
    ];
  }
  if (state) profileWhere.state = state;
  if (category) profileWhere.categories = { has: category };

  try {
    const users = await prisma.user.findMany({
    where: {
      role: "AYUDANTE",
      status: "APROBADO",
      profile: { is: profileWhere },
      listings: { some: listingFilter },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      profile: {
        select: {
          displayName: true,
          avatarUrl: true,
          state: true,
          municipality: true,
          bio: true,
          categories: true,
        },
      },
      _count: { select: { listings: { where: { status: "APROBADA" } } } },
      listings: {
        where: { status: "APROBADA" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { category: true },
      },
    },
  });

  return NextResponse.json({
    professionals: users
      .filter((u) => u.profile)
      .map((u) => {
        const profile = u.profile!;
        return {
          id: u.id,
          displayName: profile.displayName,
          avatarUrl: getAvatarUrl(profile.displayName, profile.avatarUrl, u.id),
          state: profile.state,
          municipality: profile.municipality,
          bio: profile.bio,
          categories: profile.categories,
          listingsCount: u._count.listings,
          primaryCategory: u.listings[0]?.category ?? profile.categories[0] ?? null,
        };
      }),
  });
  } catch (err) {
    console.error("[api/professionals]", err);
    const message =
      process.env.NODE_ENV === "production"
        ? "No se pudieron cargar los profesionales. Intenta de nuevo en unos minutos."
        : err instanceof Error
          ? err.message
          : "Error interno";
    return apiErrorResponse(ApiErrorCode.INTERNAL, message, 500);
  }
}
