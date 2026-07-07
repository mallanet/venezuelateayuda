import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { abroadMapPosition, isAbroadState } from "@/lib/abroad";
import { getSessionUser } from "@/lib/session-guards";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";
import { listingSchema, parseSearchParams, listingsQuerySchema } from "@/lib/validation";
import { buildApprovedListingsWhere, mapListingRowToPublic } from "@/lib/listings-query";

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const parsed = parseSearchParams(listingsQuerySchema, url.searchParams);
  if (!parsed.success) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      parsed.error.issues[0]?.message ?? "Filtros inválidos",
      400
    );
  }

  const listings = await prisma.helpListing.findMany({
    where: buildApprovedListingsWhere(parsed.data),
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
    listings: listings.map(mapListingRowToPublic),
  });
}

export async function POST(req: Request): Promise<NextResponse> {
  const { user, error } = await getSessionUser({ requireApproved: true });
  if (error) return error;

  const json: unknown = await req.json().catch(() => null);
  const parsed = listingSchema.safeParse(json);
  if (!parsed.success) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      parsed.error.issues[0]?.message ?? "Datos inválidos",
      400
    );
  }

  const data = parsed.data;
  const abroad = isAbroadState(data.state);
  const coords = abroad ? abroadMapPosition(user.id) : { lat: data.lat, lng: data.lng };

  const listing = await prisma.helpListing.create({
    data: {
      ...data,
      lat: coords.lat,
      lng: coords.lng,
      modality: abroad ? "ONLINE" : data.modality,
      type: abroad ? "OFREZCO" : data.type,
      userId: user.id,
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
