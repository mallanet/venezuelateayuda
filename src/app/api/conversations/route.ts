import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-helpers";

/** Lista las conversaciones del usuario con último mensaje y contador de no leídos. */
export async function GET() {
  const { user, error } = await getSessionUser();
  if (error) return error;

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participantAId: user.id }, { participantBId: user.id }] },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, type: true } },
      participantA: { select: { id: true, profile: { select: { displayName: true } } } },
      participantB: { select: { id: true, profile: { select: { displayName: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: {
          messages: { where: { readAt: null, senderId: { not: user.id } } },
        },
      },
    },
  });

  return NextResponse.json({
    conversations: conversations.map((c) => {
      const other = c.participantAId === user.id ? c.participantB : c.participantA;
      return {
        id: c.id,
        listing: c.listing,
        otherName: other.profile?.displayName?.split(" ")[0] ?? "Anónimo",
        lastMessage: c.messages[0]?.body?.slice(0, 80) ?? null,
        lastMessageAt: c.messages[0]?.createdAt ?? c.createdAt,
        unreadCount: c._count.messages,
      };
    }),
  });
}

/** Crea (o recupera) la conversación entre el usuario y el dueño de la ficha. */
export async function POST(req: Request) {
  const { user, error } = await getSessionUser({ requireApproved: true });
  if (error) return error;

  const body = await req.json().catch(() => null);
  const listingId = String(body?.listingId ?? "");
  if (!listingId) return NextResponse.json({ error: "Ficha inválida" }, { status: 400 });

  const listing = await prisma.helpListing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "APROBADA") {
    return NextResponse.json({ error: "Ficha no disponible" }, { status: 404 });
  }
  if (listing.userId === user.id) {
    return NextResponse.json({ error: "No puedes contactar tu propia ficha" }, { status: 400 });
  }

  const existing = await prisma.conversation.findUnique({
    where: {
      listingId_participantAId_participantBId: {
        listingId,
        participantAId: user.id,
        participantBId: listing.userId,
      },
    },
  });
  if (existing) return NextResponse.json({ conversation: existing });

  const conversation = await prisma.conversation.create({
    data: {
      listingId,
      participantAId: user.id,
      participantBId: listing.userId,
    },
  });
  return NextResponse.json({ conversation }, { status: 201 });
}
