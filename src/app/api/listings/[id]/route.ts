import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session-guards";
import { auth } from "@/lib/auth";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";
import { listingCloseSchema } from "@/lib/validation";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await ctx.params;
  const session = await auth();

  const listing = await prisma.helpListing.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, profile: { select: { displayName: true } } } },
    },
  });
  if (!listing) {
    return apiErrorResponse(ApiErrorCode.NOT_FOUND, "Ficha no encontrada", 404);
  }

  const isOwner = session?.user?.id === listing.userId;
  const isAdmin = session?.user?.role === "ADMIN";
  if (listing.status !== "APROBADA" && !isOwner && !isAdmin) {
    return apiErrorResponse(ApiErrorCode.NOT_FOUND, "Ficha no disponible", 404);
  }

  return NextResponse.json({
    listing: {
      id: listing.id,
      type: listing.type,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      state: listing.state,
      municipality: listing.municipality,
      lat: listing.lat,
      lng: listing.lng,
      status: listing.status,
      createdAt: listing.createdAt,
      authorName: listing.user.profile?.displayName?.split(" ")[0] ?? "Anónimo",
      isOwner,
    },
  });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await ctx.params;
  const { user, error } = await getSessionUser();
  if (error) return error;

  const listing = await prisma.helpListing.findUnique({ where: { id } });
  if (!listing) {
    return apiErrorResponse(ApiErrorCode.NOT_FOUND, "Ficha no encontrada", 404);
  }
  if (listing.userId !== user.id) {
    return apiErrorResponse(ApiErrorCode.FORBIDDEN, "No puedes modificar esta ficha", 403);
  }

  const json: unknown = await req.json().catch(() => null);
  const parsed = listingCloseSchema.safeParse(json);
  if (!parsed.success) {
    return apiErrorResponse(ApiErrorCode.UNSUPPORTED, "Acción no soportada", 400);
  }

  const updated = await prisma.helpListing.update({
    where: { id },
    data: { status: "CERRADA" },
  });
  return NextResponse.json({ listing: updated });
}
