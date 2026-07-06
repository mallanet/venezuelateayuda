"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicListing } from "@/lib/types";
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
import { VENEZUELA_STATES } from "@/lib/venezuela";
import { fetchJson } from "@/lib/fetch-json";
import { cn } from "@/lib/utils";

const ListingsMap = dynamic(() => import("@/components/map/listings-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const ALL = "TODOS";

/**
 * Vista principal del mapa: filtros, mapa a pantalla completa y lista
 * sincronizada (panel lateral en escritorio, hoja inferior en móvil).
 */
export function MapExplorer() {
  const [type, setType] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [stateFilter, setStateFilter] = useState(ALL);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (type !== ALL) params.set("type", type);
    if (category !== ALL) params.set("category", category);
    if (stateFilter !== ALL) params.set("state", stateFilter);
    const qs = params.toString();
    return `/api/listings${qs ? `?${qs}` : ""}`;
  }, [type, category, stateFilter]);

  const { data, isLoading } = useSWR<{ listings: PublicListing[] }>(query, fetchJson, {
    refreshInterval: 60_000,
  });
  const listings = data?.listings ?? [];

  return (
    <div className="flex flex-1 flex-col" data-testid="map-explorer">
      <div className="border-b bg-background px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-44" data-testid="filter-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[1300]">
              <SelectItem value={ALL}>Ofrezco y necesito</SelectItem>
              <SelectItem value="OFREZCO">Ofrezco ayuda</SelectItem>
              <SelectItem value="NECESITO">Necesito ayuda</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-44" data-testid="filter-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[1300]">
              <SelectItem value={ALL}>Todas las categorías</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full sm:w-44" data-testid="filter-state">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[1300]">
              <SelectItem value={ALL}>Todo el país</SelectItem>
              {VENEZUELA_STATES.map((s) => (
                <SelectItem key={s.name} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="ml-auto text-sm text-muted-foreground" data-testid="results-count">
            {isLoading ? "Cargando..." : `${listings.length} fichas`}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <aside className="hidden w-96 shrink-0 overflow-y-auto border-r md:block">
          <ListingList
            listings={listings}
            isLoading={isLoading}
            focusId={focusId}
            onFocus={setFocusId}
            testId="listing-list-desktop"
          />
        </aside>

        <div className="relative h-[calc(100dvh-8.5rem)] flex-1 md:h-auto">
          <ListingsMap listings={listings} focusId={focusId} />

          <div className="absolute inset-x-0 bottom-0 z-[1000] md:hidden">
            <button
              type="button"
              onClick={() => setListOpen((v) => !v)}
              className="mx-auto flex w-full items-center justify-center gap-2 rounded-t-2xl border-t bg-background px-4 py-3 text-sm font-medium shadow-[0_-4px_12px_rgba(0,0,0,.08)]"
              aria-expanded={listOpen}
            >
              {listOpen ? "Ocultar lista" : `Ver lista (${listings.length})`}
            </button>
            <div
              className={cn(
                "overflow-y-auto bg-background transition-[max-height] duration-300",
                listOpen ? "max-h-[45dvh]" : "max-h-0"
              )}
            >
              <ListingList
                listings={listings}
                isLoading={isLoading}
                focusId={focusId}
                onFocus={setFocusId}
                testId="listing-list-mobile"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingList({
  listings,
  isLoading,
  focusId,
  onFocus,
  testId,
}: {
  listings: PublicListing[];
  isLoading: boolean;
  focusId: string | null;
  onFocus: (id: string) => void;
  testId: string;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="grid gap-3 p-6 text-center text-sm text-muted-foreground">
        <p>No hay fichas con estos filtros todavía.</p>
        <Button asChild variant="outline" size="sm" className="justify-self-center">
          <Link href="/ayuda/nueva">Sé la primera persona en publicar</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid gap-2 p-3" data-testid={testId}>
      {listings.map((listing) => (
        <li key={listing.id}>
          <button
            type="button"
            onClick={() => onFocus(listing.id)}
            className={cn(
              "grid w-full gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-muted",
              focusId === listing.id && "border-primary ring-1 ring-primary"
            )}
          >
            <div className="flex items-center gap-2">
              <Badge
                variant={listing.type === "OFREZCO" ? "default" : "destructive"}
                className="text-[10px]"
              >
                {LISTING_TYPE_LABELS[listing.type]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {CATEGORY_ICONS[listing.category]} {CATEGORY_LABELS[listing.category]}
              </span>
            </div>
            <span className="text-sm font-medium">{listing.title}</span>
            <span className="text-xs text-muted-foreground">
              {listing.municipality}, {listing.state} · por {listing.authorName}
            </span>
            <Link
              href={`/ayuda/${listing.id}`}
              className="text-xs font-medium text-primary underline"
              onClick={(e) => e.stopPropagation()}
            >
              Ver ficha completa
            </Link>
          </button>
        </li>
      ))}
    </ul>
  );
}
