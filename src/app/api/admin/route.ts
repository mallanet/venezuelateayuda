import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/session-guards";

/** Datos del panel de administración: colas de moderación y métricas. */
export async function GET() {
  const { error } = await getAdminUser();
  if (error) return error;

  const [pendingUsers, recentRegistrations, pendingListings, openReports, metrics] =
    await Promise.all([
      prisma.user.findMany({
        where: { status: "PENDIENTE", role: { not: "ADMIN" } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          profile: {
            select: { displayName: true, state: true, municipality: true, phone: true },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: { not: "ADMIN" } },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          profile: {
            select: { displayName: true, state: true, municipality: true, phone: true },
          },
        },
      }),
      prisma.helpListing.findMany({
        where: { status: "PENDIENTE" },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { email: true, profile: { select: { displayName: true } } } },
        },
      }),
      prisma.report.findMany({
        where: { status: "ABIERTA" },
        orderBy: { createdAt: "asc" },
        include: {
          reporter: { select: { email: true } },
          reportedUser: { select: { id: true, email: true, status: true } },
          reportedListing: { select: { id: true, title: true, status: true } },
        },
      }),
      Promise.all([
        prisma.user.count({ where: { role: { not: "ADMIN" } } }),
        prisma.user.count({ where: { status: "APROBADO", role: { not: "ADMIN" } } }),
        prisma.helpListing.count({ where: { status: "APROBADA" } }),
        prisma.helpListing.count({ where: { status: "CERRADA" } }),
        prisma.message.count(),
      ]),
    ]);

  const [totalUsers, approvedUsers, activeListings, closedListings, totalMessages] = metrics;

  return NextResponse.json({
    pendingUsers,
    recentRegistrations,
    pendingListings,
    openReports,
    metrics: { totalUsers, approvedUsers, activeListings, closedListings, totalMessages },
  });
}
