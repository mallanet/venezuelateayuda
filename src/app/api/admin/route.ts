import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/session-guards";

/** Datos completos del panel: colas, historial y auditoría. */
export async function GET() {
  const { error } = await getAdminUser();
  if (error) return error;

  const userSelect = {
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
        state: true,
        municipality: true,
        phone: true,
      },
    },
    _count: { select: { listings: true } },
  } as const;

  const [
    users,
    listings,
    reports,
    auditLogs,
    metrics,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: userSelect,
    }),
    prisma.helpListing.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        category: true,
        state: true,
        municipality: true,
        status: true,
        rejectReason: true,
        quantity: true,
        quantityUnit: true,
        modality: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        reason: true,
        status: true,
        resolution: true,
        createdAt: true,
        updatedAt: true,
        reporter: { select: { email: true } },
        reportedUser: {
          select: { id: true, email: true, status: true },
        },
        reportedListing: {
          select: { id: true, title: true, status: true },
        },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 120,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        detail: true,
        createdAt: true,
        admin: { select: { email: true } },
      },
    }),
    Promise.all([
      prisma.user.count({ where: { role: { not: "ADMIN" } } }),
      prisma.user.count({ where: { status: "PENDIENTE", role: { not: "ADMIN" } } }),
      prisma.user.count({ where: { status: "APROBADO", role: { not: "ADMIN" } } }),
      prisma.user.count({ where: { status: "RECHAZADO", role: { not: "ADMIN" } } }),
      prisma.user.count({ where: { status: "SUSPENDIDO", role: { not: "ADMIN" } } }),
      prisma.helpListing.count({ where: { status: "PENDIENTE" } }),
      prisma.helpListing.count({ where: { status: "APROBADA" } }),
      prisma.helpListing.count({ where: { status: "RECHAZADA" } }),
      prisma.helpListing.count({ where: { status: "CERRADA" } }),
      prisma.report.count({ where: { status: "ABIERTA" } }),
      prisma.message.count(),
    ]),
  ]);

  const [
    totalUsers,
    pendingUsers,
    approvedUsers,
    rejectedUsers,
    suspendedUsers,
    pendingListings,
    activeListings,
    rejectedListings,
    closedListings,
    openReports,
    totalMessages,
  ] = metrics;

  return NextResponse.json({
    users,
    listings,
    reports,
    auditLogs,
    metrics: {
      totalUsers,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      suspendedUsers,
      pendingListings,
      activeListings,
      rejectedListings,
      closedListings,
      openReports,
      totalMessages,
    },
    // Compat con tests e2e existentes
    pendingUsers: users.filter((u) => u.status === "PENDIENTE"),
    pendingListings: listings.filter((l) => l.status === "PENDIENTE"),
    openReports: reports.filter((r) => r.status === "ABIERTA"),
    recentRegistrations: users.slice(0, 30),
  });
}
