import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-helpers";
import { messageSchema } from "@/lib/validation";

async function getConversationForUser(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      listing: { select: { id: true, title: true } },
      participantA: { select: { id: true, profile: { select: { displayName: true } } } },
      participantB: { select: { id: true, profile: { select: { displayName: true } } } },
    },
  });
  if (!conversation) return null;
  if (conversation.participantAId !== userId && conversation.participantBId !== userId) return null;
  return conversation;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { user, error } = await getSessionUser();
  if (error) return error;

  const conversation = await getConversationForUser(id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  // Marca como leídos los mensajes recibidos.
  await prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  const other =
    conversation.participantAId === user.id ? conversation.participantB : conversation.participantA;

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      listing: conversation.listing,
      otherName: other.profile?.displayName?.split(" ")[0] ?? "Anónimo",
      otherUserId: other.id,
    },
    messages: messages.map((message) => ({
      id: message.id,
      body: message.body,
      mine: message.senderId === user.id,
      createdAt: message.createdAt,
    })),
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { user, error } = await getSessionUser({ requireApproved: true });
  if (error) return error;

  const conversation = await getConversationForUser(id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = messageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Mensaje inválido" },
      { status: 400 }
    );
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: id, senderId: user.id, body: parsed.data.body },
    }),
    prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);

  return NextResponse.json({ message }, { status: 201 });
}
