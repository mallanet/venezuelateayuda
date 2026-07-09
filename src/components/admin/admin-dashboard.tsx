"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  LogOut,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { Logotype } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
import { formatListingMeta } from "@/lib/listing-meta";
import { fetchJson } from "@/lib/fetch-json";
import type {
  Category,
  HelpModality,
  ListingStatus,
  ListingType,
  QuantityUnit,
  ReportStatus,
  Role,
  UserStatus,
} from "@prisma/client";

type AdminUser = {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  profile: {
    displayName: string;
    state: string;
    municipality: string;
    phone: string | null;
  } | null;
  _count: { listings: number };
};

type AdminListing = {
  id: string;
  type: ListingType;
  title: string;
  description: string;
  category: Category;
  state: string;
  municipality: string;
  status: ListingStatus;
  rejectReason: string | null;
  quantity: number;
  quantityUnit: QuantityUnit;
  modality: HelpModality;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; profile: { displayName: string } | null };
};

type AdminReport = {
  id: string;
  reason: string;
  status: ReportStatus;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: { email: string };
  reportedUser: { id: string; email: string; status: string } | null;
  reportedListing: { id: string; title: string; status: string } | null;
};

type AuditEntry = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string | null;
  ip: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  path: string | null;
  httpMethod: string | null;
  country: string | null;
  createdAt: string;
  admin: { email: string };
};

type ActivityEntry = {
  id: string;
  eventType: string;
  userId: string | null;
  email: string | null;
  ip: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  path: string | null;
  httpMethod: string | null;
  country: string | null;
  detail: unknown;
  createdAt: string;
};

type AdminData = {
  users: AdminUser[];
  listings: AdminListing[];
  reports: AdminReport[];
  auditLogs: AuditEntry[];
  activityLogs: ActivityEntry[];
  metrics: {
    totalUsers: number;
    pendingUsers: number;
    approvedUsers: number;
    rejectedUsers: number;
    suspendedUsers: number;
    pendingListings: number;
    activeListings: number;
    rejectedListings: number;
    closedListings: number;
    openReports: number;
    totalMessages: number;
  };
  pendingUsers: AdminUser[];
  pendingListings: AdminListing[];
  openReports: AdminReport[];
};

const USER_STATUS_LABEL: Record<UserStatus, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  SUSPENDIDO: "Suspendido",
};

const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CERRADA: "Cerrada",
};

const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  ABIERTA: "Abierta",
  RESUELTA: "Resuelta",
  DESCARTADA: "Descartada",
};

const ACTION_LABEL: Record<string, string> = {
  aprobar_usuario: "Aprobó usuario",
  rechazar_usuario: "Rechazó usuario",
  suspender_usuario: "Suspendió usuario",
  reactivar_usuario: "Reactivó usuario",
  aprobar_ficha: "Aprobó ficha",
  rechazar_ficha: "Rechazó ficha",
  resolver_denuncia: "Resolvió denuncia",
  limpiar_datos_demo: "Limpió demos",
};

const EVENT_LABEL: Record<string, string> = {
  register: "Registro",
  login_success: "Login OK",
  login_failure: "Login fallido",
  admin_login_success: "Admin login OK",
  admin_login_failure: "Admin login fallido",
  profile_update: "Perfil actualizado",
  listing_create: "Ficha creada",
  admin_action: "Acción admin",
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case "PENDIENTE":
    case "ABIERTA":
      return "bg-[var(--mallanet-blue-50)] text-[var(--mallanet-blue-800)] border-[var(--mallanet-blue-200)]";
    case "APROBADO":
    case "APROBADA":
    case "RESUELTA":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "RECHAZADO":
    case "RECHAZADA":
    case "SUSPENDIDO":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "CERRADA":
    case "DESCARTADA":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function roleLabel(role: Role): string {
  if (role === "AYUDANTE") return "Ayudante / profesional";
  if (role === "SOLICITANTE") return "Solicitante";
  return "Admin";
}

export function AdminDashboard() {
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR<AdminData>("/api/admin", fetchJson);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string>("PENDIENTE");
  const [userRole, setUserRole] = useState<string>("ALL");
  const [userQuery, setUserQuery] = useState("");
  const [listingStatus, setListingStatus] = useState<string>("PENDIENTE");
  const [listingQuery, setListingQuery] = useState("");
  const [reportStatus, setReportStatus] = useState<string>("ABIERTA");
  const [auditQuery, setAuditQuery] = useState("");
  const [activityQuery, setActivityQuery] = useState("");
  const [activityType, setActivityType] = useState<string>("ALL");

  async function runAction(payload: Record<string, string>, busyKey: string) {
    setBusyId(busyKey);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        toast.error(errorBody.error ?? "No se pudo ejecutar la acción");
        return;
      }
      toast.success("Acción registrada");
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

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const q = userQuery.trim().toLowerCase();
    return data.users.filter((u) => {
      if (userStatus !== "ALL" && u.status !== userStatus) return false;
      if (userRole !== "ALL" && u.role !== userRole) return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        (u.profile?.displayName ?? "").toLowerCase().includes(q) ||
        (u.profile?.state ?? "").toLowerCase().includes(q) ||
        (u.profile?.municipality ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, userStatus, userRole, userQuery]);

  const filteredListings = useMemo(() => {
    if (!data) return [];
    const q = listingQuery.trim().toLowerCase();
    return data.listings.filter((l) => {
      if (listingStatus !== "ALL" && l.status !== listingStatus) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.user.email.toLowerCase().includes(q) ||
        (l.user.profile?.displayName ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, listingStatus, listingQuery]);

  const filteredReports = useMemo(() => {
    if (!data) return [];
    return data.reports.filter((r) => reportStatus === "ALL" || r.status === reportStatus);
  }, [data, reportStatus]);

  const filteredAudit = useMemo(() => {
    if (!data) return [];
    const q = auditQuery.trim().toLowerCase();
    if (!q) return data.auditLogs;
    return data.auditLogs.filter((a) => {
      const label = (ACTION_LABEL[a.action] ?? a.action).toLowerCase();
      return (
        label.includes(q) ||
        a.action.toLowerCase().includes(q) ||
        a.admin.email.toLowerCase().includes(q) ||
        (a.detail ?? "").toLowerCase().includes(q) ||
        a.targetId.toLowerCase().includes(q) ||
        (a.ip ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, auditQuery]);

  const filteredActivity = useMemo(() => {
    if (!data) return [];
    const logs = data.activityLogs ?? [];
    const q = activityQuery.trim().toLowerCase();
    return logs.filter((a) => {
      if (activityType !== "ALL" && a.eventType !== activityType) return false;
      if (!q) return true;
      const label = (EVENT_LABEL[a.eventType] ?? a.eventType).toLowerCase();
      return (
        label.includes(q) ||
        a.eventType.toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q) ||
        (a.ip ?? "").toLowerCase().includes(q) ||
        (a.userAgent ?? "").toLowerCase().includes(q) ||
        (a.browser ?? "").toLowerCase().includes(q) ||
        (a.os ?? "").toLowerCase().includes(q) ||
        (a.path ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, activityQuery, activityType]);

  if (isLoading || !data) {
    return (
      <div className="bg-section-glow min-h-screen">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10">
          <div className="vta-skeleton h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="vta-skeleton h-28 rounded-2xl" />
            ))}
          </div>
          <div className="vta-skeleton h-[28rem] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const m = data.metrics;

  return (
    <div className="bg-section-glow min-h-screen">
      <header className="border-b border-[#EFF3F8] bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logotype size={36} />
            <div>
              <p className="font-mono-tokens text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
                Mallanet · Moderación
              </p>
              <h1 className="font-display text-xl font-extrabold text-primary sm:text-2xl">
                Panel de administración
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/" target="_blank" rel="noreferrer">
                Ver sitio
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut({ redirect: false });
                router.replace("/admin/login");
                router.refresh();
              }}
            >
              <LogOut className="size-3.5" aria-hidden />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Usuarios pendientes",
              value: m.pendingUsers,
              hint: `${m.approvedUsers} aprobados · ${m.totalUsers} total`,
              icon: Users,
            },
            {
              label: "Fichas pendientes",
              value: m.pendingListings,
              hint: `${m.activeListings} activas · ${m.closedListings} cerradas`,
              icon: ClipboardList,
            },
            {
              label: "Denuncias abiertas",
              value: m.openReports,
              hint: `${m.rejectedUsers} usuarios rechazados`,
              icon: FileWarning,
            },
            {
              label: "Mensajes",
              value: m.totalMessages,
              hint: `${m.suspendedUsers} suspendidos`,
              icon: Shield,
            },
          ].map((metric) => (
            <Card
              key={metric.label}
              className="overflow-hidden border-border/60 bg-card shadow-soft"
            >
              <div className="accent-rule h-0.5 w-full" aria-hidden />
              <CardContent className="flex items-start justify-between gap-3 pt-5">
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {metric.label}
                  </p>
                  <p className="mt-1 font-mono-tokens text-3xl font-bold tabular-nums text-primary">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
                </div>
                <div className="rounded-xl bg-secondary p-2.5 text-primary">
                  <metric.icon className="size-5" aria-hidden />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Tabs defaultValue="usuarios" className="grid gap-4">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted p-1.5">
            <TabsTrigger
              value="usuarios"
              data-testid="tab-usuarios"
              className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Usuarios ({m.pendingUsers})
            </TabsTrigger>
            <TabsTrigger
              value="fichas"
              data-testid="tab-fichas"
              className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Fichas ({m.pendingListings})
            </TabsTrigger>
            <TabsTrigger
              value="denuncias"
              data-testid="tab-denuncias"
              className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Denuncias ({m.openReports})
            </TabsTrigger>
            <TabsTrigger
              value="auditoria"
              data-testid="tab-auditoria"
              className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Auditoría ({data.auditLogs.length})
            </TabsTrigger>
            <TabsTrigger
              value="actividad"
              data-testid="tab-actividad"
              className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Actividad ({(data.activityLogs ?? []).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="mt-0">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="gap-4 border-b border-border/40 pb-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-lg font-semibold text-primary">
                      Cuentas registradas
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aprueba profesionales (ayudantes) y solicitantes. Filtra por estado y rol.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-accent/30 text-accent">
                    {filteredUsers.length} visibles
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="relative sm:col-span-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Buscar nombre, email o estado…"
                      className="pl-9"
                    />
                  </div>
                  <Select value={userStatus} onValueChange={setUserStatus}>
                    <SelectTrigger aria-label="Filtrar por estado">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="z-[1300]">
                      <SelectItem value="ALL">Todos los estados</SelectItem>
                      <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                      <SelectItem value="APROBADO">Aprobados</SelectItem>
                      <SelectItem value="RECHAZADO">Rechazados</SelectItem>
                      <SelectItem value="SUSPENDIDO">Suspendidos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={userRole} onValueChange={setUserRole}>
                    <SelectTrigger aria-label="Filtrar por rol">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent className="z-[1300]">
                      <SelectItem value="ALL">Todos los roles</SelectItem>
                      <SelectItem value="AYUDANTE">Ayudantes / profesionales</SelectItem>
                      <SelectItem value="SOLICITANTE">Solicitantes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay cuentas con estos filtros.</p>
                ) : (
                  <ul className="grid gap-3" data-testid="pending-users">
                    {filteredUsers.map((user) => (
                      <li
                        key={user.id}
                        className="grid gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                      >
                        <div className="grid gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-base font-extrabold text-primary">
                              {user.profile?.displayName ?? "(sin perfil)"}
                            </span>
                            <Badge
                              variant="outline"
                              className={statusBadgeClass(user.status)}
                            >
                              {USER_STATUS_LABEL[user.status]}
                            </Badge>
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                              {roleLabel(user.role)}
                            </Badge>
                            {user.emailVerified ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-emerald-800"
                              >
                                <CheckCircle2 className="size-3" aria-hidden />
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
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                            {user.profile
                              ? ` · ${user.profile.municipality}, ${user.profile.state}`
                              : ""}
                            {user.profile?.phone ? ` · ${user.profile.phone}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Registrado {formatDate(user.createdAt)} · {user._count.listings} ficha
                            {user._count.listings === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {user.status === "PENDIENTE" && (
                            <>
                              <Button
                                size="sm"
                                disabled={busyId === user.id}
                                data-testid={`approve-user-${user.email}`}
                                onClick={() =>
                                  runAction({ action: "aprobar_usuario", userId: user.id }, user.id)
                                }
                              >
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={busyId === user.id}
                                onClick={() => {
                                  const reason = promptReason("Motivo del rechazo:");
                                  if (reason)
                                    runAction(
                                      { action: "rechazar_usuario", userId: user.id, reason },
                                      user.id
                                    );
                                }}
                              >
                                Rechazar
                              </Button>
                            </>
                          )}
                          {user.status === "APROBADO" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busyId === user.id}
                              onClick={() => {
                                const reason = promptReason("Motivo de la suspensión:");
                                if (reason)
                                  runAction(
                                    { action: "suspender_usuario", userId: user.id, reason },
                                    user.id
                                  );
                              }}
                            >
                              Suspender
                            </Button>
                          )}
                          {(user.status === "SUSPENDIDO" || user.status === "RECHAZADO") && (
                            <Button
                              size="sm"
                              disabled={busyId === user.id}
                              onClick={() =>
                                runAction(
                                  { action: "reactivar_usuario", userId: user.id },
                                  user.id
                                )
                              }
                            >
                              Reactivar
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fichas" className="mt-0">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="gap-4 border-b border-border/40 pb-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-lg font-semibold text-primary">
                      Fichas de ayuda
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Historial completo: pendientes, aprobadas, rechazadas y cerradas.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-accent/30 text-accent">
                    {filteredListings.length} visibles
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={listingQuery}
                      onChange={(e) => setListingQuery(e.target.value)}
                      placeholder="Buscar título, autor o descripción…"
                      className="pl-9"
                    />
                  </div>
                  <Select value={listingStatus} onValueChange={setListingStatus}>
                    <SelectTrigger aria-label="Filtrar fichas por estado">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="z-[1300]">
                      <SelectItem value="ALL">Todos los estados</SelectItem>
                      <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                      <SelectItem value="APROBADA">Aprobadas</SelectItem>
                      <SelectItem value="RECHAZADA">Rechazadas</SelectItem>
                      <SelectItem value="CERRADA">Cerradas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {filteredListings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay fichas con estos filtros.</p>
                ) : (
                  <ul className="grid gap-3" data-testid="pending-listings">
                    {filteredListings.map((listing) => (
                      <li
                        key={listing.id}
                        className="grid gap-3 rounded-2xl border border-border/60 bg-card p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
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
                          <Badge
                            variant="outline"
                            className={statusBadgeClass(listing.status)}
                          >
                            {LISTING_STATUS_LABEL[listing.status]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {listing.municipality}, {listing.state}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-display text-base font-extrabold text-primary">
                            {listing.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                            {listing.description}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatListingMeta(
                            listing.quantity,
                            listing.quantityUnit,
                            listing.modality
                          )}{" "}
                          · Por {listing.user.profile?.displayName ?? "—"} ({listing.user.email}) ·{" "}
                          {formatDate(listing.createdAt)}
                        </p>
                        {listing.rejectReason && (
                          <p className="rounded-xl bg-destructive/5 px-3 py-2 text-xs text-destructive">
                            Motivo rechazo: {listing.rejectReason}
                          </p>
                        )}
                        {listing.status === "PENDIENTE" && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              disabled={busyId === listing.id}
                              data-testid={`approve-listing-${listing.id}`}
                              onClick={() =>
                                runAction(
                                  { action: "aprobar_ficha", listingId: listing.id },
                                  listing.id
                                )
                              }
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busyId === listing.id}
                              onClick={() => {
                                const reason = promptReason("Motivo del rechazo:");
                                if (reason)
                                  runAction(
                                    {
                                      action: "rechazar_ficha",
                                      listingId: listing.id,
                                      reason,
                                    },
                                    listing.id
                                  );
                              }}
                            >
                              Rechazar
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/ayuda/${listing.id}`} target="_blank">
                                Ver ficha
                              </Link>
                            </Button>
                          </div>
                        )}
                        {listing.status !== "PENDIENTE" && (
                          <div>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/ayuda/${listing.id}`} target="_blank">
                                Ver ficha
                              </Link>
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="denuncias" className="mt-0">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="gap-4 border-b border-border/40 pb-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-lg font-semibold text-primary">
                      Denuncias
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Abiertas, resueltas y descartadas.
                    </p>
                  </div>
                  <Select value={reportStatus} onValueChange={setReportStatus}>
                    <SelectTrigger className="w-[200px]" aria-label="Filtrar denuncias">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[1300]">
                      <SelectItem value="ALL">Todas</SelectItem>
                      <SelectItem value="ABIERTA">Abiertas</SelectItem>
                      <SelectItem value="RESUELTA">Resueltas</SelectItem>
                      <SelectItem value="DESCARTADA">Descartadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {filteredReports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay denuncias con este filtro.</p>
                ) : (
                  <ul className="grid gap-3" data-testid="open-reports">
                    {filteredReports.map((report) => (
                      <li
                        key={report.id}
                        className="grid gap-3 rounded-2xl border border-border/60 bg-card p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={statusBadgeClass(report.status)}
                          >
                            {REPORT_STATUS_LABEL[report.status]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{report.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          Denunciante: {report.reporter.email}
                          {report.reportedUser && <> · Usuario: {report.reportedUser.email}</>}
                          {report.reportedListing && (
                            <>
                              {" "}
                              · Ficha:{" "}
                              <Link
                                href={`/ayuda/${report.reportedListing.id}`}
                                className="font-medium text-accent underline-offset-2 link-underline"
                              >
                                {report.reportedListing.title}
                              </Link>
                            </>
                          )}
                        </p>
                        {report.resolution && (
                          <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                            Resolución: {report.resolution}
                          </p>
                        )}
                        {report.status === "ABIERTA" && (
                          <div className="flex flex-wrap gap-2">
                            {report.reportedUser &&
                              report.reportedUser.status !== "SUSPENDIDO" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={busyId === report.id}
                                  onClick={() => {
                                    const reason = promptReason("Motivo de la suspensión:");
                                    if (reason)
                                      runAction(
                                        {
                                          action: "suspender_usuario",
                                          userId: report.reportedUser!.id,
                                          reason,
                                        },
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
                              onClick={() => {
                                const resolution = promptReason("Resolución:");
                                if (resolution)
                                  runAction(
                                    {
                                      action: "resolver_denuncia",
                                      reportId: report.id,
                                      resolution,
                                      outcome: "RESUELTA",
                                    },
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
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria" className="mt-0">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="gap-4 border-b border-border/40 pb-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-lg font-semibold text-primary">
                      Registro de auditoría
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Cada aprobación, rechazo, suspensión o resolución queda registrada.
                    </p>
                  </div>
                  <div className="relative w-full max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={auditQuery}
                      onChange={(e) => setAuditQuery(e.target.value)}
                      placeholder="Buscar en el registro…"
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {filteredAudit.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aún no hay eventos de auditoría.</p>
                ) : (
                  <ul className="grid gap-2" data-testid="audit-log">
                    {filteredAudit.map((entry) => (
                      <li
                        key={entry.id}
                        className="grid gap-1 rounded-xl border border-border/50 bg-card px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {ACTION_LABEL[entry.action] ?? entry.action}
                            <span className="font-normal text-muted-foreground">
                              {" "}
                              · {entry.targetType} · {entry.targetId.slice(0, 10)}…
                            </span>
                          </p>
                          {entry.detail && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{entry.detail}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            Por {entry.admin.email}
                            {entry.ip ? ` · IP ${entry.ip}` : ""}
                            {entry.browser || entry.os
                              ? ` · ${[entry.browser, entry.os, entry.device].filter(Boolean).join(" / ")}`
                              : ""}
                          </p>
                        </div>
                        <time className="text-xs text-muted-foreground tabular-nums">
                          {formatDate(entry.createdAt)}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actividad" className="mt-0">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="gap-4 border-b border-border/40 pb-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <CardTitle className="font-display flex items-center gap-2 text-lg font-semibold text-primary">
                      <Activity className="size-5" aria-hidden />
                      Actividad de usuarios
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Logins, registros y mutaciones con IP, email y navegador.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-accent/30 text-accent">
                    {filteredActivity.length} visibles
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="relative sm:col-span-2">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={activityQuery}
                      onChange={(e) => setActivityQuery(e.target.value)}
                      placeholder="Buscar email, IP, UA, ruta…"
                      className="pl-9"
                      data-testid="activity-search"
                    />
                  </div>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger aria-label="Filtrar por tipo de evento">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent className="z-[1300]">
                      <SelectItem value="ALL">Todos los eventos</SelectItem>
                      {Object.entries(EVENT_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {filteredActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay eventos con estos filtros.</p>
                ) : (
                  <ul className="grid gap-2" data-testid="activity-log">
                    {filteredActivity.map((entry) => (
                      <li
                        key={entry.id}
                        className="grid gap-1 rounded-xl border border-border/50 bg-card px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-start"
                      >
                        <div className="grid gap-1">
                          <p className="text-sm font-medium text-foreground">
                            {EVENT_LABEL[entry.eventType] ?? entry.eventType}
                            <span className="font-normal text-muted-foreground">
                              {" "}
                              · {entry.email ?? "(sin email)"}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[
                              entry.ip ? `IP ${entry.ip}` : null,
                              [entry.browser, entry.os, entry.device].filter(Boolean).join(" / ") ||
                                null,
                              entry.country ? `país ${entry.country}` : null,
                              entry.httpMethod && entry.path
                                ? `${entry.httpMethod} ${entry.path}`
                                : entry.path,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {entry.userAgent && (
                            <p className="truncate text-[11px] text-muted-foreground/80" title={entry.userAgent}>
                              {entry.userAgent}
                            </p>
                          )}
                        </div>
                        <time className="text-xs text-muted-foreground tabular-nums">
                          {formatDate(entry.createdAt)}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
