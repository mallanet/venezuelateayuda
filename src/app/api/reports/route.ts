import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-helpers";
import { reportSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const { user, error } = await getSessionUser();
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { reason, listingId, userId } = parsed.data;
  if (!listingId && !userId) {
    return NextResponse.json({ error: "Debes indicar qué denuncias" }, { status: 400 });
  }

  let reportedUserId = userId ?? null;
  if (listingId) {
    const listing = await prisma.helpListing.findUnique({ where: { id: listingId } });
    if (!listing) return NextResponse.json({ error: "Ficha no encontrada" }, { status: 404 });
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
