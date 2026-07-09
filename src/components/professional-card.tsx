"use client";

import Link from "next/link";
import Image from "next/image";
import type { PublicProfessional } from "@/lib/types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { abroadLocationLabel, isAbroadState } from "@/lib/abroad";
import { cn } from "@/lib/utils";

interface ProfessionalCardProps {
  professional: PublicProfessional;
  selected?: boolean;
}

/** Tarjeta de ayudante verificado para el directorio de profesionales. */
export function ProfessionalCard({ professional, selected }: ProfessionalCardProps) {
  const category = professional.primaryCategory;
  const CategoryIcon = category ? CATEGORY_ICONS[category] : undefined;

  return (
    <article
      className={cn(
        "grid overflow-hidden rounded-xl border border-border/60 bg-card shadow-soft hover-lift focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        selected && "border-primary ring-2 ring-primary/30"
      )}
      data-testid={`professional-card-${professional.id}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <Image
          src={professional.avatarUrl}
          alt={`Foto de ${professional.displayName}`}
          fill
          unoptimized
          className="object-cover object-center"
          sizes="(max-width:768px) 50vw, 25vw"
        />
      </div>
      <div className="grid gap-2 p-4 text-center">
        <h3 className="font-semibold leading-tight">{professional.displayName}</h3>
        <p className="text-xs text-muted-foreground">
          {isAbroadState(professional.state)
            ? abroadLocationLabel(professional.municipality)
            : `${professional.municipality}, ${professional.state}`}
        </p>
        {isAbroadState(professional.state) && (
          <Badge variant="success" className="mx-auto w-fit text-[10px]">
            🌍 Ayuda online
          </Badge>
        )}
        {category && CategoryIcon && (
          <Badge className="mx-auto w-fit text-[10px] uppercase tracking-wide">
            <CategoryIcon className="size-3" />
            {CATEGORY_LABELS[category]}
          </Badge>
        )}
        {professional.bio && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{professional.bio}</p>
        )}
        <span className="text-xs text-muted-foreground">
          {professional.listingsCount}{" "}
          {professional.listingsCount === 1 ? "ficha activa" : "fichas activas"}
        </span>
        <Link
          href={`/mapa?state=${encodeURIComponent(professional.state)}`}
          className="text-xs font-medium text-primary underline underline-offset-2 link-underline transition-[color] hover:text-accent"
        >
          Ver en el mapa
        </Link>
      </div>
    </article>
  );
}
