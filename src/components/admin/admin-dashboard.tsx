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
        const errData = await res.json();
        toast.error(errData.error ?? "No se pudo ejecutar la acción");
        return;
      }
      toast.success("Acción aplicada");
      await mutate();
    } finally {
      setBusyId(null);
    }
  }

  function promptReason(message: string): string | null {
    const reason = window.prompt(message);
    if (reason === null) return null;
    if (!reason.trim()) {
      toast.error("Debes indicar un motivo");
      return null;
    }
    return reason.trim();
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-10">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold">Panel de administración</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Usuarios", value: data.metrics.totalUsers },
          { label: "Aprobados", value: data.metrics.approvedUsers },
          { label: "Fichas activas", value: data.metrics.activeListings },
          { label: "Resueltas", value: data.metrics.closedListings },
          { label: "Mensajes", value: data.metrics.totalMessages },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList className="w-full flex-wrap sm:w-auto">
          <TabsTrigger value="usuarios" data-testid="tab-usuarios">
            Usuarios ({data.pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="fichas" data-testid="tab-fichas">
            Fichas ({data.pendingListings.length})
          </TabsTrigger>
          <TabsTrigger value="denuncias" data-testid="tab-denuncias">
            Denuncias ({data.openReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios pendientes de aprobación</CardTitle>
            </CardHeader>
            <CardContent>
              {data.pendingUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay usuarios pendientes.</p>
              ) : (
                <ul className="grid gap-3" data-testid="pending-users">
                  {data.pendingUsers.map((u) => (
                    <li
                      key={u.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                    >
                      <div className="grid gap-1">
                        <span className="font-medium">{u.profile?.displayName ?? "(sin perfil)"}</span>
                        <span className="text-xs text-muted-foreground">
                          {u.email} · {u.role === "AYUDANTE" ? "Ayudante" : "Solicitante"} ·{" "}
                          {u.profile?.municipality}, {u.profile?.state}
                        </span>
                        <div className="flex gap-2">
                          {u.emailVerified ? (
                            <Badge variant="outline">Email verificado</Badge>
                          ) : (
                            <Badge variant="destructive">Email sin verificar</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={busyId === u.id}
                          data-testid={`approve-user-${u.email}`}
                          onClick={() => runAction({ action: "aprobar_usuario", userId: u.id }, u.id)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === u.id}
                          onClick={() => {
                            const reason = promptReason("Motivo del rechazo:");
                            if (reason) runAction({ action: "rechazar_usuario", userId: u.id, reason }, u.id);
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
          <Card>
            <CardHeader>
              <CardTitle>Fichas pendientes de aprobación</CardTitle>
            </CardHeader>
            <CardContent>
              {data.pendingListings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay fichas pendientes.</p>
              ) : (
                <ul className="grid gap-3" data-testid="pending-listings">
                  {data.pendingListings.map((l) => (
                    <li key={l.id} className="grid gap-2 rounded-lg border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={l.type === "OFREZCO" ? "default" : "destructive"}>
                          {LISTING_TYPE_LABELS[l.type]}
                        </Badge>
                        <Badge variant="secondary">{CATEGORY_LABELS[l.category]}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {l.municipality}, {l.state}
                        </span>
                      </div>
                      <span className="font-medium">{l.title}</span>
                      <p className="text-sm text-muted-foreground">{l.description}</p>
                      <span className="text-xs text-muted-foreground">
                        Por: {l.user.profile?.displayName} ({l.user.email})
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={busyId === l.id}
                          data-testid={`approve-listing-${l.id}`}
                          onClick={() => runAction({ action: "aprobar_ficha", listingId: l.id }, l.id)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === l.id}
                          onClick={() => {
                            const reason = promptReason("Motivo del rechazo:");
                            if (reason) runAction({ action: "rechazar_ficha", listingId: l.id, reason }, l.id);
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
          <Card>
            <CardHeader>
              <CardTitle>Denuncias abiertas</CardTitle>
            </CardHeader>
            <CardContent>
              {data.openReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay denuncias abiertas.</p>
              ) : (
                <ul className="grid gap-3" data-testid="open-reports">
                  {data.openReports.map((r) => (
                    <li key={r.id} className="grid gap-2 rounded-lg border p-4">
                      <p className="text-sm">{r.reason}</p>
                      <span className="text-xs text-muted-foreground">
                        Denunciante: {r.reporter.email}
                        {r.reportedUser && <> · Denunciado: {r.reportedUser.email}</>}
                        {r.reportedListing && (
                          <>
                            {" "}
                            · Ficha:{" "}
                            <Link href={`/ayuda/${r.reportedListing.id}`} className="underline">
                              {r.reportedListing.title}
                            </Link>
                          </>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {r.reportedUser && r.reportedUser.status !== "SUSPENDIDO" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busyId === r.id}
                            onClick={() => {
                              const reason = promptReason("Motivo de la suspensión:");
                              if (reason)
                                runAction(
                                  { action: "suspender_usuario", userId: r.reportedUser!.id, reason },
                                  r.id
                                );
                            }}
                          >
                            Suspender usuario
                          </Button>
                        )}
                        <Button
                          size="sm"
                          disabled={busyId === r.id}
                          onClick={() => {
                            const resolution = promptReason("Resolución:");
                            if (resolution)
                              runAction(
                                { action: "resolver_denuncia", reportId: r.id, resolution, outcome: "RESUELTA" },
                                r.id
                              );
                          }}
                        >
                          Marcar resuelta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === r.id}
                          onClick={() =>
                            runAction(
                              {
                                action: "resolver_denuncia",
                                reportId: r.id,
                                resolution: "Descartada sin acción",
                                outcome: "DESCARTADA",
                              },
                              r.id
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
