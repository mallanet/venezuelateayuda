import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-helpers";
import { auth } from "@/lib/auth";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await auth();

  const listing = await prisma.helpListing.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, profile: { select: { displayName: true } } } },
    },
  });
  if (!listing) return NextResponse.json({ error: "Ficha no encontrada" }, { status: 404 });

  const isOwner = session?.user?.id === listing.userId;
  const isAdmin = session?.user?.role === "ADMIN";
  if (listing.status !== "APROBADA" && !isOwner && !isAdmin) {
    return NextResponse.json({ error: "Ficha no disponible" }, { status: 404 });
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

/** El dueño puede cerrar su ficha; el resto de cambios de estado son del admin. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { user, error } = await getSessionUser();
  if (error) return error;

  const listing = await prisma.helpListing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Ficha no encontrada" }, { status: 404 });
  if (listing.userId !== user.id) {
    return NextResponse.json({ error: "No puedes modificar esta ficha" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (body?.action !== "cerrar") {
    return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
  }

  const updated = await prisma.helpListing.update({
    where: { id },
    data: { status: "CERRADA" },
  });
  return NextResponse.json({ listing: updated });
}
