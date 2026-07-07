import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session-guards";
import { conversationCreateSchema } from "@/lib/validation";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";

export async function GET(): Promise<NextResponse> {
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
    conversations: conversations.map((conversation) => {
      const other =
        conversation.participantAId === user.id
          ? conversation.participantB
          : conversation.participantA;
      return {
        id: conversation.id,
        listing: conversation.listing,
        otherName: other.profile?.displayName?.split(" ")[0] ?? "Anónimo",
        lastMessage: conversation.messages[0]?.body?.slice(0, 80) ?? null,
        lastMessageAt: conversation.messages[0]?.createdAt ?? conversation.createdAt,
        unreadCount: conversation._count.messages,
      };
    }),
  });
}

export async function POST(req: Request): Promise<NextResponse> {
  const { user, error } = await getSessionUser({ requireApproved: true });
  if (error) return error;

  const json: unknown = await req.json().catch(() => null);
  const parsed = conversationCreateSchema.safeParse(json);
  if (!parsed.success) {
    return apiErrorResponse(
      ApiErrorCode.VALIDATION,
      parsed.error.issues[0]?.message ?? "Ficha inválida",
      400
    );
  }

  const { listingId } = parsed.data;
  const listing = await prisma.helpListing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "APROBADA") {
    return apiErrorResponse(ApiErrorCode.NOT_FOUND, "Ficha no disponible", 404);
  }
  if (listing.userId === user.id) {
    return apiErrorResponse(ApiErrorCode.VALIDATION, "No puedes contactar tu propia ficha", 400);
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      listingId,
      OR: [
        { participantAId: user.id, participantBId: listing.userId },
        { participantAId: listing.userId, participantBId: user.id },
      ],
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
