import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session-guards";
import { reportSchema } from "@/lib/validation";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";

export async function POST(req: Request): Promise<NextResponse> {
  const { user, error } = await getSessionUser();
  if (error) return error;

  const json: unknown = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse(json);
  if (!parsed.success) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      parsed.error.issues[0]?.message ?? "Datos inválidos",
      400
    );
  }

  const { reason, listingId, userId } = parsed.data;
  if (!listingId && !userId) {
    return apiErrorResponse(ApiErrorCode.VALIDATION, "Debes indicar qué denuncias", 400);
  }

  let reportedUserId = userId ?? null;
  if (listingId) {
    const listing = await prisma.helpListing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return apiErrorResponse(ApiErrorCode.NOT_FOUND, "Ficha no encontrada", 404);
    }
    reportedUserId = reportedUserId ?? listing.userId;
  }

  const report = await prisma.report.create({
    data: {
      reporterId: user.id,
      reportedListingId: listingId ?? null,
      reportedUserId,
      reason,
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}
