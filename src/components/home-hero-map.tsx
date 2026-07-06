"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/listing-card";
import {
  MapFilterSidebar,
  FILTER_ALL,
  buildListingsQuery,
  type MapFilters,
} from "@/components/map-filter-sidebar";
import type { PublicListing } from "@/lib/types";
import { fetchJson } from "@/lib/fetch-json";

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
  });
  const [focusId, setFocusId] = useState<string | null>(null);

  const query = useMemo(() => buildListingsQuery(filters), [filters]);
  const { data, isLoading } = useSWR<{ listings: PublicListing[] }>(query, fetchJson, {
    refreshInterval: 60_000,
  });
  const listings = data?.listings ?? [];
  const preview = listings.slice(0, 8);

  function updateFilters(patch: Partial<MapFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  return (
    <section
      className="bg-gradient-to-b from-primary/10 to-background px-4 py-10 md:py-14"
      data-testid="home-hero-map"
    >
      <div className="mx-auto grid max-w-7xl gap-8">
        <div className="mx-auto grid max-w-3xl gap-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
            Conectamos ayuda con quien la necesita
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Venezuela Te Ayuda es un mapa de ayuda mutua: publica lo que puedes ofrecer o lo
            que necesitas, y encuentra personas verificadas cerca de ti.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/registro">Quiero ayudar</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/registro">Necesito ayuda</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Registro en menos de 2 minutos ·{" "}
            <Link href="/profesionales" className="font-medium text-primary underline">
              Ver directorio de profesionales
            </Link>
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <MapFilterSidebar
            filters={filters}
            onChange={updateFilters}
            resultsCount={listings.length}
            isLoading={isLoading}
            className="rounded-xl border bg-card p-5 shadow-sm"
          />

          <div className="grid gap-4">
            <div className="h-[340px] overflow-hidden rounded-xl border shadow-md sm:h-[420px] md:h-[480px]">
              <ListingsMap listings={listings} focusId={focusId} />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Personas verificadas cerca de ti</h2>
            <Button asChild variant="link" size="sm">
              <Link href="/mapa">Ver mapa completo</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : preview.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
              <p>No hay fichas con estos filtros todavía.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/registro">Sé la primera persona en registrarse</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {preview.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  selected={focusId === listing.id}
                  onSelect={() => setFocusId(listing.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
