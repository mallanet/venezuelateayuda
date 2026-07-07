import { redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">Mi perfil</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {user.role === "AYUDANTE" ? "Perfil: Ayudante" : user.role === "ADMIN" ? "Perfil: Administración" : "Perfil: Solicitante"}
              </Badge>
              <Badge variant={statusVariant(user.status)} data-testid="account-status">
                Cuenta: {STATUS_LABELS[user.status]}
              </Badge>
              {!user.emailVerified && <Badge variant="destructive">Email sin verificar</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {user.status === "PENDIENTE" && (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              Tu cuenta está siendo revisada por nuestro equipo. Cuando sea
              aprobada podrás publicar fichas y contactar a otras personas.
            </div>
          )}
          <ProfileForm
            role={user.role}
            initial={{
              displayName: profile.displayName,
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mis fichas</CardTitle>
            <Button asChild size="sm">
              <Link href="/ayuda/nueva">Publicar ficha</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no has publicado ninguna ficha.
            </p>
          ) : (
            <ul className="grid gap-3" data-testid="my-listings">
              {listings.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-4"
                >
                  <div className="grid gap-1">
                    <Link href={`/ayuda/${l.id}`} className="font-medium hover:underline">
                      {l.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {LISTING_TYPE_LABELS[l.type]} · {CATEGORY_LABELS[l.category]} ·{" "}
                      {l.municipality}, {l.state}
                    </span>
                    {l.status === "RECHAZADA" && l.rejectReason && (
                      <span className="text-xs text-destructive">
                        Motivo del rechazo: {l.rejectReason}
                      </span>
                    )}
                  </div>
                  <Badge variant={statusVariant(l.status)}>{STATUS_LABELS[l.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
