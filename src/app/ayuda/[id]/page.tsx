import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_ICONS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
import { formatListingMeta } from "@/lib/listing-meta";
import { ContactButton } from "@/components/contact-button";
import { ReportDialog } from "@/components/report-dialog";
import { CloseListingButton } from "@/components/close-listing-button";
import { ListingMiniMap } from "@/components/map/listing-mini-map";

export default async function FichaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const listing = await prisma.helpListing.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, profile: { select: { displayName: true } } } },
    },
  });
  if (!listing) notFound();

  const isOwner = session?.user?.id === listing.userId;
  const isAdmin = session?.user?.role === "ADMIN";
  if (listing.status !== "APROBADA" && !isOwner && !isAdmin) notFound();

  const authorName = listing.user.profile?.displayName?.split(" ")[0] ?? "Anónimo";
  const CategoryIcon = CATEGORY_ICONS[listing.category];
  const canContact =
    session?.user &&
    !isOwner &&
    session.user.status === "APROBADO" &&
    listing.status === "APROBADA";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <span aria-hidden>&larr;</span> Volver al mapa
        </Link>
      </div>

      <Card className="overflow-hidden border-accent/10 shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-destructive" />
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={listing.type === "OFREZCO" ? "default" : "destructive"}
              className={listing.type === "OFREZCO" ? "bg-primary text-primary-foreground" : ""}
            >
              {LISTING_TYPE_LABELS[listing.type]}
            </Badge>
            <Badge variant="secondary" className="border-accent/20 bg-accent/10 text-accent-foreground">
              <CategoryIcon className="size-3" />
              {CATEGORY_LABELS[listing.category]}
            </Badge>
            <Badge variant="outline">
              {formatListingMeta(listing.quantity, listing.quantityUnit, listing.modality)}
            </Badge>
            {listing.status !== "APROBADA" && (
              <Badge variant="outline" className="border-destructive/20 text-destructive">
                {listing.status === "RECHAZADA" ? "Rechazada" : listing.status.toLowerCase()}
              </Badge>
            )}
          </div>
          <h1 className="font-heading text-2xl font-semibold text-primary">
            {listing.title}
          </h1>
          <CardDescription className="text-sm">
            {listing.municipality}, {listing.state} · publicada por {authorName} ·{" "}
            {listing.createdAt.toLocaleDateString("es-VE", { dateStyle: "medium" })}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="rounded-xl bg-accent/5 p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {listing.description}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-accent/20">
            <ListingMiniMap lat={listing.lat} lng={listing.lng} />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-1 w-1 rounded-full bg-accent" />
            La ubicación mostrada es aproximada para proteger la privacidad.
          </p>

          <Separator className="bg-accent/10" />

          <div className="flex flex-wrap items-center gap-3">
            {canContact && <ContactButton listingId={listing.id} />}
            {!session?.user && (
              <Button asChild className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/login">Inicia sesión para contactar</Link>
              </Button>
            )}
            {session?.user && session.user.status !== "APROBADO" && !isOwner && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="inline-block h-1 w-1 rounded-full bg-accent" />
                Podrás contactar cuando tu cuenta sea aprobada.
              </p>
            )}
            {isOwner && listing.status !== "CERRADA" && (
              <CloseListingButton listingId={listing.id} />
            )}
            {session?.user && !isOwner && (
              <ReportDialog listingId={listing.id} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
