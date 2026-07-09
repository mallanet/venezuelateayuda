import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, Inbox } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
import { ProfileForm } from "@/components/profile-form";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "En revisión",
  APROBADO: "Aprobada",
  RECHAZADO: "Rechazada",
  SUSPENDIDO: "Suspendida",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CERRADA: "Resuelta",
};

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "APROBADO" || status === "APROBADA") return "default";
  if (status === "PENDIENTE") return "secondary";
  if (status === "CERRADA") return "outline";
  return "destructive";
}

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, profile, listings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true, status: true, emailVerified: true },
    }),
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.helpListing.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user || !profile) redirect("/login");

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-10">
      <div className="flex items-center gap-3 border-b border-accent/20 pb-4">
        <Logo size={32} />
        <span className="font-heading text-sm font-semibold tracking-wide text-primary/60 uppercase">
          Mi cuenta
        </span>
      </div>

      <Card className="border-accent/10 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-2xl">Mi perfil</CardTitle>
              <CardDescription className="text-sm">{user.email}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/20 text-primary">
                {user.role === "AYUDANTE" ? "Ayudante" : user.role === "ADMIN" ? "Administración" : "Solicitante"}
              </Badge>
              <Badge variant={statusVariant(user.status)} data-testid="account-status">
                {STATUS_LABELS[user.status]}
              </Badge>
              {!user.emailVerified && (
                <Badge variant="destructive" className="border-destructive/20">
                  Email sin verificar
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {user.status === "PENDIENTE" && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-foreground">
              <Clock className="size-4 shrink-0 text-accent" />
              Tu cuenta está siendo revisada por nuestro equipo. Cuando sea
              aprobada podrás publicar fichas y contactar a otras personas.
            </div>
          )}
          <ProfileForm
            role={user.role}
            userId={session.user.id}
            initial={{
              displayName: profile.displayName,
              avatarUrl: profile.avatarUrl,
              phone: profile.phone ?? "",
              bio: profile.bio ?? "",
              state: profile.state,
              municipality: profile.municipality,
              radiusKm: profile.radiusKm,
              categories: profile.categories,
            }}
          />
        </CardContent>
      </Card>

      <Card className="border-accent/10 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-xl">Mis fichas</CardTitle>
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/ayuda/nueva">Publicar ficha</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Inbox className="size-8 text-accent/40" />
              <p className="text-sm text-muted-foreground">
                Aún no has publicado ninguna ficha.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3" data-testid="my-listings">
              {listings.map((listing) => (
                <li
                  key={listing.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/10 bg-card p-4 transition-colors hover:border-accent/30"
                >
                  <div className="grid gap-1.5">
                    <Link
                      href={`/ayuda/${listing.id}`}
                      className="font-heading font-medium text-primary hover:text-primary/80 hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {LISTING_TYPE_LABELS[listing.type]} · {CATEGORY_LABELS[listing.category]} ·{" "}
                      {listing.municipality}, {listing.state}
                    </span>
                    {listing.status === "RECHAZADA" && listing.rejectReason && (
                      <span className="text-xs text-destructive">
                        Motivo del rechazo: {listing.rejectReason}
                      </span>
                    )}
                  </div>
                  <Badge variant={statusVariant(listing.status)} className="shrink-0">
                    {STATUS_LABELS[listing.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
