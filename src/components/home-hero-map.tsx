"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/listing-card";

const ListingDetailModal = dynamic(
  () => import("@/components/listing-detail-modal").then((mod) => mod.ListingDetailModal),
  { ssr: false }
);
import {
  MapFilterSidebar,
  FILTER_ALL,
  buildListingsQuery,
  type MapFilters,
} from "@/components/map-filter-sidebar";
import type { PublicListing } from "@/lib/types";
import { distanceKm, filterWithinRadius, sortByDistance } from "@/lib/geo";
import { fetchJson } from "@/lib/fetch-json";
import { useHasGeolocation } from "@/lib/use-client-mounted";
import { cn } from "@/lib/utils";
import type { MapUserLocation } from "@/components/map/listings-map";

const ListingsMap = dynamic(() => import("@/components/map/listings-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
});

/** Hero del home con mapa embebido, filtros tipo directorio y fichas con avatar. */
export function HomeHeroMap() {
  const [filters, setFilters] = useState<MapFilters>({
    q: "",
    type: FILTER_ALL,
    category: FILTER_ALL,
    state: FILTER_ALL,
    nearMe: false,
  });
  const [focusId, setFocusId] = useState<string | null>(null);
  const [modalListing, setModalListing] = useState<PublicListing | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<MapUserLocation | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasGeolocation = useHasGeolocation();

  const requestUserLocation = useCallback(() => {
    if (!hasGeolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  }, [hasGeolocation]);

  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  useEffect(() => {
    if (filters.nearMe && !userLocation) requestUserLocation();
  }, [filters.nearMe, userLocation, requestUserLocation]);

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

  const preview = useMemo(() => {
    let pool = visibleListings;
    if (filters.type === "NECESITO") {
      pool = visibleListings.filter((l) => l.type === "OFREZCO");
    } else if (filters.type === FILTER_ALL && userLocation) {
      const helpers = visibleListings.filter((l) => l.type === "OFREZCO");
      if (helpers.length > 0) pool = helpers;
    }
    return pool.slice(0, 8);
  }, [visibleListings, filters.type, userLocation]);

  function distanceFor(listing: PublicListing): number | undefined {
    if (!userLocation) return undefined;
    return Math.round(distanceKm(userLocation, listing));
  }

  function updateFilters(patch: Partial<MapFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  return (
    <section
      className="bg-hero-glow relative overflow-hidden px-4 pb-16 pt-12 md:pb-20 md:pt-16"
      data-testid="home-hero-map"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px accent-rule" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10">
        <div className="mx-auto grid max-w-3xl gap-5 text-center">
          <span className="reveal delay-1 inline-flex items-center justify-center gap-2 self-center rounded-full border border-accent/30 bg-accent/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-accent-foreground uppercase">
            <span className="inline-block size-1.5 rounded-full bg-accent" aria-hidden />
            Mapa de ayuda mutua · Venezuela
          </span>
          <h1 className="reveal delay-2 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-primary sm:text-5xl md:text-6xl">
            Conectamos ayuda con quien la necesita
          </h1>
          <p className="reveal delay-3 mx-auto max-w-2xl text-base text-pretty text-muted-foreground md:text-lg">
            Venezuela Te Ayuda es un mapa de ayuda mutua: publica lo que puedes ofrecer o lo que
            necesitas, y encuentra personas verificadas cerca de ti.
          </p>
          <div className="reveal delay-4 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="shadow-soft">
              <Link href="/registro">Quiero ayudar</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              <Link href="/registro">Necesito ayuda</Link>
            </Button>
          </div>
          <p className="reveal delay-5 text-sm text-muted-foreground">
            <span className="font-mono-tokens">Registro en menos de 2 minutos</span>
            <span className="mx-2 text-accent" aria-hidden>
              ·
            </span>
            <Link
              href="/profesionales"
              className="font-medium text-primary underline underline-offset-4 link-underline"
            >
              Ver directorio de profesionales
            </Link>
          </p>
        </div>

        <div className="reveal-in delay-5 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="order-2 lg:order-1 hidden lg:block">
            <MapFilterSidebar
              filters={filters}
              onChange={updateFilters}
              resultsCount={visibleListings.length}
              isLoading={isLoading}
              showNearMeFilter
              locationReady={!!userLocation}
              hasGeolocation={hasGeolocation}
              className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-soft backdrop-blur"
            />
          </aside>

          <div className="order-1 relative grid gap-4 lg:order-2">
            {/* Mobile filter toggle — absolute overlay sobre el mapa */}
            <div className="absolute top-3 left-3 z-[1000] lg:hidden">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/95 px-4 py-2 text-sm font-medium text-primary shadow-soft backdrop-blur"
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                Filtros
                <ChevronDown
                  className={cn("size-4 text-muted-foreground transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)]", filtersOpen && "rotate-180")}
                  aria-hidden
                />
              </button>
              {filtersOpen && (
                <div className="absolute top-12 left-0 right-0 z-[1000] max-h-[70dvh] w-72 overflow-y-auto rounded-2xl border border-border/60 bg-card/95 p-5 shadow-elevated backdrop-blur">
                  <MapFilterSidebar
                    filters={filters}
                    onChange={updateFilters}
                    resultsCount={visibleListings.length}
                    isLoading={isLoading}
                    showNearMeFilter
                    locationReady={!!userLocation}
                    hasGeolocation={hasGeolocation}
                  />
                </div>
              )}
            </div>

            <div className="relative h-[340px] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated sm:h-[420px] md:h-[480px]">
              <span
                className="pointer-events-none absolute top-0 right-0 z-[400] h-10 w-10 rounded-bl-2xl border-l border-b border-accent/30 bg-gradient-to-bl from-accent/15 to-transparent"
                aria-hidden
              />
              <ListingsMap listings={visibleListings} focusId={focusId} userLocation={userLocation} />
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid gap-1">
              <h2 className="font-display text-2xl font-semibold text-primary">
                {userLocation ? "Ayuda más cercana a ti" : "Personas verificadas cerca de ti"}
              </h2>
              {userLocation ? (
                <p className="text-xs text-muted-foreground">
                  Ordenadas por distancia · azul ofrece ayuda, rojo la solicita, amarillo desde el exterior
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Fichas moderadas manualmente · activa &ldquo;Cerca de mí&rdquo; para ver tu zona
                </p>
              )}
            </div>
            <Button asChild variant="link" size="sm" className="font-medium text-primary">
              <Link href="/mapa">Ver mapa completo →</Link>
            </Button>
          </div>

          {error ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 p-10 text-center text-muted-foreground">
              <p className="font-medium text-foreground">No se pudieron cargar las fichas.</p>
              <p className="mt-1 text-sm">Revisa tu conexión e intenta de nuevo.</p>
            </div>
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="vta-skeleton h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : preview.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 p-10 text-center text-muted-foreground">
              <p className="font-medium text-foreground">No hay fichas con estos filtros todavía.</p>
              <p className="mt-1 text-sm">Puedes ser la primera persona en registrarte en tu zona.</p>
              <Button asChild className="mt-5 shadow-soft" variant="outline">
                <Link href="/registro">Registrarme ahora</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {preview.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  selected={focusId === listing.id}
                  distanceKm={distanceFor(listing)}
                  onSelect={() => {
                    setFocusId(listing.id);
                    setModalListing(listing);
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ListingDetailModal listing={modalListing} open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}
