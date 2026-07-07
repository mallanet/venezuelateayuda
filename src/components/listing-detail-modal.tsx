"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicListing } from "@/lib/types";
import { CATEGORY_ICONS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
import { formatVeDate } from "@/lib/dates";
import { formatListingMeta } from "@/lib/listing-meta";
import { getMapsDirectionsUrl, getWhatsAppContactUrl } from "@/lib/listing-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ListingDetailModalProps {
  listing: PublicListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modal con ficha completa, foto de la persona y acciones de maps / WhatsApp. */
export function ListingDetailModal({ listing, open, onOpenChange }: ListingDetailModalProps) {
  if (!listing) return null;

  const mapsUrl = getMapsDirectionsUrl(listing);
  const whatsAppUrl = getWhatsAppContactUrl(listing);
  const CategoryIcon = CATEGORY_ICONS[listing.category];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto border-border/60 bg-card shadow-elevated sm:max-w-lg"
        data-testid="listing-detail-modal"
      >
        <div className="accent-rule h-0.5 w-full rounded-t-2xl" aria-hidden />
        <DialogHeader>
          <div className="relative mx-auto mb-2 size-32">
            <span
              className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-accent/30 to-primary/20 blur-sm"
              aria-hidden
            />
            <div className="relative size-32 overflow-hidden rounded-full border-4 border-card shadow-soft ring-1 ring-accent/30">
              <Image
                src={listing.authorAvatarUrl}
                alt={`Foto de ${listing.authorDisplayName}`}
                fill
                className="object-cover"
                sizes="128px"
                unoptimized
              />
            </div>
          </div>
          <DialogTitle className="font-display text-center text-2xl font-semibold text-primary">
            {listing.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {listing.authorDisplayName} · {listing.municipality}, {listing.state}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant={listing.type === "OFREZCO" ? "default" : "destructive"}>
              {LISTING_TYPE_LABELS[listing.type]}
            </Badge>
            <Badge variant="secondary" className="inline-flex items-center gap-1">
              <CategoryIcon className="size-3.5" />
              {CATEGORY_LABELS[listing.category]}
            </Badge>
            <Badge variant="outline">
              {formatListingMeta(listing.quantity, listing.quantityUnit, listing.modality)}
            </Badge>
          </div>

          <div className="rounded-xl border border-accent/10 bg-accent/[0.04] p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {listing.description}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Publicada el {formatVeDate(listing.createdAt, "long")}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full shadow-soft" variant="default">
            <Link href={`/ayuda/${listing.id}`}>Ver ficha completa y chat interno →</Link>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" data-testid="maps-button">
              Cómo llegar
            </a>
          </Button>
          <Button asChild className="w-full" variant="ghost" size="sm">
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" data-testid="whatsapp-button">
              Contactar por WhatsApp
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
