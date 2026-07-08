import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/session-guards";

/**
 * Lista cuentas registradas recientemente para moderación.
 * Requiere sesión ADMIN (login en /login → panel /admin).
 *
 * Query:
 *  - status: PENDIENTE|APROBADO|RECHAZADO|SUSPENDIDO|ALL (default PENDIENTE)
 *  - limit: 1–200 (default 50)
 */
export async function GET(req: Request): Promise<NextResponse> {
  const { error } = await getAdminUser();
  if (error) return error;

  const url = new URL(req.url);
  const statusParam = (url.searchParams.get("status") ?? "PENDIENTE").toUpperCase();
  const limit = Math.min(
    200,
    Math.max(1, Number(url.searchParams.get("limit") ?? "50") || 50)
  );

  const statusFilter =
    statusParam === "ALL"
      ? undefined
      : statusParam === "PENDIENTE" ||
          statusParam === "APROBADO" ||
          statusParam === "RECHAZADO" ||
          statusParam === "SUSPENDIDO"
        ? statusParam
        : "PENDIENTE";

  const users = await prisma.user.findMany({
    where: {
      role: { not: "ADMIN" },
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          displayName: true,
          phone: true,
          state: true,
          municipality: true,
        },
      },
      _count: {
        select: { listings: true },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    filter: { status: statusFilter ?? "ALL", limit },
    count: users.length,
    registrations: users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      emailVerified: Boolean(u.emailVerified),
      emailVerifiedAt: u.emailVerified,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      displayName: u.profile?.displayName ?? null,
      phone: u.profile?.phone ?? null,
      state: u.profile?.state ?? null,
      municipality: u.profile?.municipality ?? null,
      listingsCount: u._count.listings,
    })),
  });
}
