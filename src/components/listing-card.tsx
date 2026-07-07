"use client";

import Link from "next/link";
import Image from "next/image";
import type { PublicListing } from "@/lib/types";
import { CATEGORY_ICONS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
import { formatListingMeta } from "@/lib/listing-meta";
import { Badge } from "@/components/ui/badge";
import { abroadLocationLabel, isAbroadState } from "@/lib/abroad";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: PublicListing;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
  distanceKm?: number;
}

/** Tarjeta estilo directorio con foto de perfil, nombre y categoría. */
export function ListingCard({ listing, selected, onSelect, compact, distanceKm }: ListingCardProps) {
  const Wrapper = onSelect ? "button" : "div";

  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      className={cn(
        "grid overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:shadow-md",
        selected && "border-primary ring-2 ring-primary/30",
        compact ? "gap-2 p-3" : "gap-0"
      )}
      data-testid={`listing-card-${listing.id}`}
    >
      <div className={cn("relative bg-muted", compact ? "mx-auto h-16 w-16 overflow-hidden rounded-full" : "aspect-[4/3] w-full")}>
        <Image
          src={listing.authorAvatarUrl}
          alt={`Foto de ${listing.authorName}`}
          fill
          className={cn("object-cover", compact ? "rounded-full" : "")}
          sizes={compact ? "64px" : "(max-width:768px) 50vw, 25vw"}
          unoptimized
        />
      </div>
      <div className={cn("grid gap-1", compact ? "text-center" : "p-4")}>
        {!compact && isAbroadState(listing.state) && (
          <Badge variant="success" className="mb-1 h-6 w-fit px-2.5 text-sm">
            🌍 Ayuda online
          </Badge>
        )}
        {!compact && (
          <Badge
            variant={listing.type === "OFREZCO" ? "default" : "destructive"}
            className="mb-1 h-6 w-fit px-2.5 text-sm"
          >
            {LISTING_TYPE_LABELS[listing.type]}
          </Badge>
        )}
        <span className="font-semibold leading-tight">{listing.title}</span>
        <span className="text-xs text-muted-foreground">
          {listing.authorName} ·{" "}
          {isAbroadState(listing.state)
            ? abroadLocationLabel(listing.municipality)
            : `${listing.municipality}, ${listing.state}`}
          {distanceKm !== undefined && ` · ~${distanceKm} km`}
        </span>
        <Badge variant="secondary" className="mt-1 w-fit text-[10px] uppercase tracking-wide">
          {CATEGORY_ICONS[listing.category]} {CATEGORY_LABELS[listing.category]}
        </Badge>
        <Badge
          variant={listing.modality === "ONLINE" ? "success" : "outline"}
          className="w-fit text-xs"
        >
          {formatListingMeta(listing.quantity, listing.quantityUnit, listing.modality)}
        </Badge>
        {!onSelect && (
          <Link
            href={`/ayuda/${listing.id}`}
            className="mt-2 text-xs font-medium text-primary underline"
          >
            Ver ficha
          </Link>
        )}
      </div>
    </Wrapper>
  );
}
