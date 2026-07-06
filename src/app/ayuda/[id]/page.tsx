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
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_ICONS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
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
  const canContact =
    session?.user &&
    !isOwner &&
    session.user.status === "APROBADO" &&
    listing.status === "APROBADA";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={listing.type === "OFREZCO" ? "default" : "destructive"}>
              {LISTING_TYPE_LABELS[listing.type]}
            </Badge>
            <Badge variant="secondary">
              {CATEGORY_ICONS[listing.category]} {CATEGORY_LABELS[listing.category]}
            </Badge>
            {listing.status !== "APROBADA" && (
              <Badge variant="outline">Estado: {listing.status.toLowerCase()}</Badge>
            )}
          </div>
          <CardTitle className="text-2xl">{listing.title}</CardTitle>
          <CardDescription>
            {listing.municipality}, {listing.state} · publicada por {authorName} ·{" "}
            {listing.createdAt.toLocaleDateString("es-VE", { dateStyle: "medium" })}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{listing.description}</p>

          <div className="h-56 overflow-hidden rounded-lg border">
            <ListingMiniMap lat={listing.lat} lng={listing.lng} />
          </div>
          <p className="text-xs text-muted-foreground">
            La ubicación mostrada es aproximada para proteger la privacidad.
          </p>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            {canContact && <ContactButton listingId={listing.id} />}
            {!session?.user && (
              <Button asChild>
                <Link href="/login">Inicia sesión para contactar</Link>
              </Button>
            )}
            {session?.user && session.user.status !== "APROBADO" && !isOwner && (
              <p className="text-sm text-muted-foreground">
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
