"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import useSWR from "swr";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapFilterSidebar,
  FILTER_ALL,
  buildListingsQuery,
  type MapFilters,
} from "@/components/map-filter-sidebar";
import type { PublicListing } from "@/lib/types";
import { CATEGORY_ICONS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
import { formatListingMeta } from "@/lib/listing-meta";
import { filterWithinRadius, sortByDistance } from "@/lib/geo";
import { fetchJson } from "@/lib/fetch-json";
import { useUserLocation } from "@/lib/geolocation";
import { cn } from "@/lib/utils";

const ListingsMap = dynamic(() => import("@/components/map/listings-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

function MapExplorerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo<MapFilters>(
    () => ({
      q: searchParams.get("q") ?? "",
      type: searchParams.get("type") ?? FILTER_ALL,
      category: searchParams.get("category") ?? FILTER_ALL,
      state: searchParams.get("state") ?? FILTER_ALL,
      nearMe: searchParams.get("nearMe") === "true",
    }),
    [searchParams]
  );

  const [focusId, setFocusId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    coords: userLocation,
    permission: geoPermission,
    isLocating,
    hasGeolocation,
    requestLocation,
    locationReady,
  } = useUserLocation({ requestOnMount: true });

  const updateFilters = useCallback(
    (patch: Partial<MapFilters>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (patch.type !== undefined) {
        if (patch.type !== FILTER_ALL) params.set("type", patch.type);
        else params.delete("type");
      }
      if (patch.category !== undefined) {
        if (patch.category !== FILTER_ALL) params.set("category", patch.category);
        else params.delete("category");
      }
      if (patch.state !== undefined) {
        if (patch.state !== FILTER_ALL) params.set("state", patch.state);
        else params.delete("state");
      }
      if (patch.q !== undefined) {
        if (patch.q.trim()) params.set("q", patch.q.trim());
        else params.delete("q");
      }
      if (patch.nearMe !== undefined) {
        if (patch.nearMe) params.set("nearMe", "true");
        else params.delete("nearMe");
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    if (filters.nearMe && !userLocation && geoPermission !== "denied" && hasGeolocation) {
      requestLocation();
    }
  }, [filters.nearMe, userLocation, geoPermission, hasGeolocation, requestLocation]);

  useEffect(() => {
    if (geoPermission === "denied" && filters.nearMe) {
      updateFilters({ nearMe: false });
    }
  }, [geoPermission, filters.nearMe, updateFilters]);

  const query = useMemo(() => buildListingsQuery(filters), [filters]);
  const { data, isLoading, error } = useSWR<{ listings: PublicListing[] }>(query, fetchJson, {
    refreshInterval: 60_000,
  });

  const listings = useMemo(() => data?.listings ?? [], [data?.listings]);

  const visibleListings = useMemo(() => {
    let pool = listings;
    if (filters.nearMe && userLocation) {
      pool = filterWithinRadius(pool, userLocation);
    }
    if (userLocation) return sortByDistance(pool, userLocation);
    return pool;
  }, [listings, userLocation, filters.nearMe]);

  if (error) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center"
        data-testid="map-explorer"
      >
        <p className="text-muted-foreground">No se pudieron cargar las fichas.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-section-glow flex flex-1 flex-col" data-testid="map-explorer">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="grid flex-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Desktop sidebar — filters + listing list */}
          <aside className="hidden overflow-y-auto rounded-2xl border border-border/60 bg-card shadow-soft lg:flex lg:flex-col">
            <MapFilterSidebar
              filters={filters}
              onChange={updateFilters}
              resultsCount={visibleListings.length}
              isLoading={isLoading}
              showNearMeFilter
              locationReady={locationReady}
              hasGeolocation={hasGeolocation}
              geoPermission={geoPermission}
              isLocating={isLocating}
              className="border-b border-border/40 p-5"
            />
            <ListingList
              listings={visibleListings}
              isLoading={isLoading}
              focusId={focusId}
              onFocus={setFocusId}
              testId="listing-list-desktop"
            />
          </aside>

          {/* Map card */}
          <div className="relative flex h-[420px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated sm:h-[480px] lg:h-[560px]">
            <span
              className="pointer-events-none absolute top-0 right-0 z-[400] h-10 w-10 rounded-bl-2xl border-l border-b border-accent/30 bg-gradient-to-bl from-accent/15 to-transparent"
              aria-hidden
            />

            {/* Mobile filter toggle */}
            <div className="absolute top-3 left-3 z-[1000] lg:hidden">
              <button
                type="button"
                onClick={() => {
                  setListOpen(false);
                  setFiltersOpen((open) => !open);
                }}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/95 px-4 py-2 text-sm font-medium text-primary shadow-soft backdrop-blur"
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                Filtros
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    filtersOpen && "rotate-180"
                  )}
                  aria-hidden
                />
              </button>
            </div>

            {/* Mobile filters panel */}
            {filtersOpen && (
              <div className="absolute top-14 left-3 right-3 z-[1000] max-h-[70dvh] overflow-y-auto rounded-2xl border border-border/60 bg-card/95 p-5 shadow-elevated backdrop-blur lg:hidden">
                <MapFilterSidebar
                  filters={filters}
                  onChange={updateFilters}
                  resultsCount={visibleListings.length}
                  isLoading={isLoading}
                  showNearMeFilter
                  locationReady={locationReady}
                  hasGeolocation={hasGeolocation}
                  geoPermission={geoPermission}
                  isLocating={isLocating}
                />
              </div>
            )}

            <div className="absolute inset-0">
              <ListingsMap
                listings={visibleListings}
                focusId={focusId}
                userLocation={userLocation}
                focusState={filters.state !== FILTER_ALL ? filters.state : null}
              />
            </div>

            {/* Mobile listing list */}
            <div className="absolute inset-x-0 bottom-0 z-[1000] lg:hidden">
              <button
                type="button"
                onClick={() => {
                  setFiltersOpen(false);
                  setListOpen((open) => !open);
                }}
                className="mx-auto flex w-full items-center justify-center gap-2 rounded-t-2xl border-t border-border/40 bg-card/95 px-4 py-3 text-sm font-medium shadow-[0_-4px_16px_rgba(27,58,92,0.10)] backdrop-blur"
                aria-expanded={listOpen}
              >
                {listOpen ? "Ocultar lista" : `Ver lista (${visibleListings.length})`}
              </button>
              <div
                className={cn(
                  "overflow-y-auto bg-card/95 backdrop-blur transition-[max-height] duration-300",
                  listOpen ? "max-h-[45dvh]" : "max-h-0"
                )}
              >
                <ListingList
                  listings={visibleListings}
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
          <div key={i} className="vta-skeleton h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="grid gap-3 p-6 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">No hay fichas con estos filtros todavía.</p>
        <p className="text-xs">Puedes ser la primera persona en publicar.</p>
        <Button asChild variant="outline" size="sm" className="justify-self-center rounded-xl">
          <Link href="/ayuda/nueva">Publicar una ficha</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid gap-2 p-3" data-testid={testId}>
      {listings.map((listing) => {
        const CategoryIcon = CATEGORY_ICONS[listing.category];
        return (
          <li key={listing.id}>
            <button
              type="button"
              onClick={() => onFocus(listing.id)}
              className={cn(
                "grid w-full gap-1.5 rounded-xl border border-border/60 bg-card p-4 text-left shadow-soft hover-lift hover-glow",
                focusId === listing.id && "border-accent ring-1 ring-accent"
              )}
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={listing.type === "OFREZCO" ? "default" : "destructive"}
                  className={
                    listing.type === "OFREZCO"
                      ? "bg-primary text-primary-foreground"
                      : "bg-destructive/10 text-destructive"
                  }
                >
                  {LISTING_TYPE_LABELS[listing.type]}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CategoryIcon className="size-3.5" />
                  {CATEGORY_LABELS[listing.category]}
                </span>
              </div>
              <span className="font-display text-sm font-medium text-foreground">
                {listing.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {listing.municipality}, {listing.state} · por {listing.authorName}
              </span>
              <Badge variant="outline" className="w-fit text-[10px]">
                {formatListingMeta(listing.quantity, listing.quantityUnit, listing.modality)}
              </Badge>
              <Link
                href={`/ayuda/${listing.id}`}
                className="text-xs font-medium text-primary underline underline-offset-2 decoration-accent/40 transition-colors hover:text-accent hover:decoration-accent"
                onClick={(e) => e.stopPropagation()}
              >
                Ver ficha completa →
              </Link>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function MapExplorer() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-section-glow" data-testid="map-explorer">
          <Skeleton className="h-8 w-48" />
        </div>
      }
    >
      <MapExplorerInner />
    </Suspense>
  );
}
