import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/session-guards";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("aprobar_usuario"), userId: z.string() }),
  z.object({ action: z.literal("rechazar_usuario"), userId: z.string(), reason: z.string().min(1) }),
  z.object({ action: z.literal("suspender_usuario"), userId: z.string(), reason: z.string().min(1) }),
  z.object({ action: z.literal("reactivar_usuario"), userId: z.string() }),
  z.object({ action: z.literal("aprobar_ficha"), listingId: z.string() }),
  z.object({ action: z.literal("rechazar_ficha"), listingId: z.string(), reason: z.string().min(1) }),
  z.object({
    action: z.literal("resolver_denuncia"),
    reportId: z.string(),
    resolution: z.string().min(1),
    outcome: z.enum(["RESUELTA", "DESCARTADA"]),
  }),
]);

export async function POST(req: Request) {
  const { user: admin, error } = await getAdminUser();
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const data = parsed.data;

  async function log(action: string, targetType: string, targetId: string, detail?: string) {
    await prisma.auditLog.create({
      data: { adminId: admin!.id, action, targetType, targetId, detail },
    });
  }

  switch (data.action) {
    case "aprobar_usuario": {
      await prisma.user.update({ where: { id: data.userId }, data: { status: "APROBADO" } });
      await log("aprobar_usuario", "User", data.userId);
      break;
    }
    case "rechazar_usuario": {
      await prisma.user.update({ where: { id: data.userId }, data: { status: "RECHAZADO" } });
      await log("rechazar_usuario", "User", data.userId, data.reason);
      break;
    }
    case "suspender_usuario": {
      await prisma.user.update({ where: { id: data.userId }, data: { status: "SUSPENDIDO" } });
      // Retira del mapa las fichas del usuario suspendido.
      await prisma.helpListing.updateMany({
        where: { userId: data.userId, status: "APROBADA" },
        data: { status: "CERRADA" },
      });
      await log("suspender_usuario", "User", data.userId, data.reason);
      break;
    }
    case "reactivar_usuario": {
      await prisma.user.update({ where: { id: data.userId }, data: { status: "APROBADO" } });
      await log("reactivar_usuario", "User", data.userId);
      break;
    }
    case "aprobar_ficha": {
      await prisma.helpListing.update({
        where: { id: data.listingId },
        data: { status: "APROBADA", rejectReason: null },
      });
      await log("aprobar_ficha", "HelpListing", data.listingId);
      break;
    }
    case "rechazar_ficha": {
      await prisma.helpListing.update({
        where: { id: data.listingId },
        data: { status: "RECHAZADA", rejectReason: data.reason },
      });
      await log("rechazar_ficha", "HelpListing", data.listingId, data.reason);
      break;
    }
    case "resolver_denuncia": {
      await prisma.report.update({
        where: { id: data.reportId },
        data: { status: data.outcome, resolution: data.resolution },
      });
      await log("resolver_denuncia", "Report", data.reportId, `${data.outcome}: ${data.resolution}`);
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
