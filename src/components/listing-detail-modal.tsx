"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicListing } from "@/lib/types";
import { CATEGORY_ICONS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg" data-testid="listing-detail-modal">
        <DialogHeader>
          <div className="relative mx-auto mb-2 h-32 w-32 overflow-hidden rounded-full border-4 border-primary/20">
            <Image
              src={listing.authorAvatarUrl}
              alt={`Foto de ${listing.authorDisplayName}`}
              fill
              className="object-cover"
              sizes="128px"
              unoptimized
            />
          </div>
          <DialogTitle className="text-center text-xl">{listing.title}</DialogTitle>
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

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {listing.description}
          </p>

          <p className="text-xs text-muted-foreground">
            Publicada el{" "}
            {new Date(listing.createdAt).toLocaleDateString("es-VE", { dateStyle: "long" })}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full" variant="default">
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" data-testid="whatsapp-button">
              Comunicarme por WhatsApp
            </a>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" data-testid="maps-button">
              Cómo llegar
            </a>
          </Button>
          <Button asChild className="w-full" variant="ghost" size="sm">
            <Link href={`/ayuda/${listing.id}`}>Ver ficha completa y chat interno</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
