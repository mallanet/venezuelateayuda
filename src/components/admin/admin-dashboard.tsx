"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
import type { Category, ListingType, Role } from "@prisma/client";
import { fetchJson } from "@/lib/fetch-json";

interface AdminData {
  pendingUsers: {
    id: string;
    email: string;
    role: Role;
    emailVerified: string | null;
    createdAt: string;
    profile: { displayName: string; state: string; municipality: string; phone: string | null } | null;
  }[];
  pendingListings: {
    id: string;
    type: ListingType;
    title: string;
    description: string;
    category: Category;
    state: string;
    municipality: string;
    createdAt: string;
    user: { email: string; profile: { displayName: string } | null };
  }[];
  openReports: {
    id: string;
    reason: string;
    createdAt: string;
    reporter: { email: string };
    reportedUser: { id: string; email: string; status: string } | null;
    reportedListing: { id: string; title: string; status: string } | null;
  }[];
  metrics: {
    totalUsers: number;
    approvedUsers: number;
    activeListings: number;
    closedListings: number;
    totalMessages: number;
  };
}

export function AdminDashboard() {
  const { data, isLoading, mutate } = useSWR<AdminData>("/api/admin", fetchJson);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function runAction(payload: Record<string, string>, busyKey: string) {
    setBusyId(busyKey);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorBody = await res.json();
        toast.error(errorBody.error ?? "No se pudo ejecutar la acción");
        return;
      }
      toast.success("Acción aplicada");
      await mutate();
    } finally {
      setBusyId(null);
    }
  }

  function promptReason(message: string): string | null {
    let reason: string | null = null;
    try {
      reason = window.prompt(message);
    } catch {
      toast.error("Operación cancelada");
      return null;
    }
    if (reason === null) {
      toast.error("Operación cancelada");
      return null;
    }
    if (!reason.trim()) {
      toast.error("Debes indicar un motivo");
      return null;
    }
    return reason.trim();
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-10">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold text-primary">
        Panel de administración
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Usuarios", value: data.metrics.totalUsers },
          { label: "Aprobados", value: data.metrics.approvedUsers },
          { label: "Fichas activas", value: data.metrics.activeListings },
          { label: "Resueltas", value: data.metrics.closedListings },
          { label: "Mensajes", value: data.metrics.totalMessages },
        ].map((metric) => (
          <Card
            key={metric.label}
            className="border-border/60 shadow-sm"
          >
            <CardContent className="pt-6 text-center">
              <div className="font-heading text-2xl font-semibold text-primary">
                {metric.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {metric.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList className="w-full flex-wrap rounded-xl bg-muted sm:w-auto">
          <TabsTrigger
            value="usuarios"
            data-testid="tab-usuarios"
            className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Usuarios ({data.pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger
            value="fichas"
            data-testid="tab-fichas"
            className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Fichas ({data.pendingListings.length})
          </TabsTrigger>
          <TabsTrigger
            value="denuncias"
            data-testid="tab-denuncias"
            className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Denuncias ({data.openReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="font-heading text-lg text-primary">
                Usuarios pendientes de aprobación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {data.pendingUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay usuarios pendientes.</p>
              ) : (
                <ul className="grid gap-3" data-testid="pending-users">
                  {data.pendingUsers.map((user) => (
                    <li
                      key={user.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-4"
                    >
                      <div className="grid gap-1">
                        <span className="font-heading font-medium text-foreground">
                          {user.profile?.displayName ?? "(sin perfil)"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email} · {user.role === "AYUDANTE" ? "Ayudante" : "Solicitante"} ·{" "}
                          {user.profile?.municipality}, {user.profile?.state}
                        </span>
                        <div className="flex gap-2">
                          {user.emailVerified ? (
                            <Badge
                              variant="outline"
                              className="border-accent/40 text-accent"
                            >
                              Email verificado
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="bg-destructive/10 text-destructive"
                            >
                              Email sin verificar
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={busyId === user.id}
                          data-testid={`approve-user-${user.email}`}
                          className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => runAction({ action: "aprobar_usuario", userId: user.id }, user.id)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === user.id}
                          className="rounded-lg"
                          onClick={() => {
                            const reason = promptReason("Motivo del rechazo:");
                            if (reason) runAction({ action: "rechazar_usuario", userId: user.id, reason }, user.id);
                          }}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fichas">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="font-heading text-lg text-primary">
                Fichas pendientes de aprobación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {data.pendingListings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay fichas pendientes.</p>
              ) : (
                <ul className="grid gap-3" data-testid="pending-listings">
                  {data.pendingListings.map((listing) => (
                    <li
                      key={listing.id}
                      className="grid gap-2 rounded-xl border border-border/60 bg-card p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={listing.type === "OFREZCO" ? "default" : "destructive"}
                          className={
                            listing.type === "OFREZCO"
                              ? "bg-primary text-primary-foreground"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {LISTING_TYPE_LABELS[listing.type]}
                        </Badge>
                        <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                          {CATEGORY_LABELS[listing.category]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {listing.municipality}, {listing.state}
                        </span>
                      </div>
                      <span className="font-heading font-medium text-foreground">
                        {listing.title}
                      </span>
                      <p className="text-sm text-muted-foreground">{listing.description}</p>
                      <span className="text-xs text-muted-foreground">
                        Por: {listing.user.profile?.displayName} ({listing.user.email})
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={busyId === listing.id}
                          data-testid={`approve-listing-${listing.id}`}
                          className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => runAction({ action: "aprobar_ficha", listingId: listing.id }, listing.id)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === listing.id}
                          className="rounded-lg"
                          onClick={() => {
                            const reason = promptReason("Motivo del rechazo:");
                            if (reason) runAction({ action: "rechazar_ficha", listingId: listing.id, reason }, listing.id);
                          }}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="denuncias">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="font-heading text-lg text-primary">
                Denuncias abiertas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {data.openReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay denuncias abiertas.</p>
              ) : (
                <ul className="grid gap-3" data-testid="open-reports">
                  {data.openReports.map((report) => (
                    <li
                      key={report.id}
                      className="grid gap-2 rounded-xl border border-border/60 bg-card p-4"
                    >
                      <p className="text-sm">{report.reason}</p>
                      <span className="text-xs text-muted-foreground">
                        Denunciante: {report.reporter.email}
                        {report.reportedUser && <> · Denunciado: {report.reportedUser.email}</>}
                        {report.reportedListing && (
                          <>
                            {" "}
                            · Ficha:{" "}
                            <Link
                              href={`/ayuda/${report.reportedListing.id}`}
                              className="font-medium text-accent underline underline-offset-2"
                            >
                              {report.reportedListing.title}
                            </Link>
                          </>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {report.reportedUser && report.reportedUser.status !== "SUSPENDIDO" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busyId === report.id}
                            className="rounded-lg"
                            onClick={() => {
                              const reason = promptReason("Motivo de la suspensión:");
                              if (reason)
                                runAction(
                                  { action: "suspender_usuario", userId: report.reportedUser!.id, reason },
                                  report.id
                                );
                            }}
                          >
                            Suspender usuario
                          </Button>
                        )}
                        <Button
                          size="sm"
                          disabled={busyId === report.id}
                          className="rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
                          onClick={() => {
                            const resolution = promptReason("Resolución:");
                            if (resolution)
                              runAction(
                                { action: "resolver_denuncia", reportId: report.id, resolution, outcome: "RESUELTA" },
                                report.id
                              );
                          }}
                        >
                          Marcar resuelta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === report.id}
                          className="rounded-lg border-border/60"
                          onClick={() =>
                            runAction(
                              {
                                action: "resolver_denuncia",
                                reportId: report.id,
                                resolution: "Descartada sin acción",
                                outcome: "DESCARTADA",
                              },
                              report.id
                            )
                          }
                        >
                          Descartar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
