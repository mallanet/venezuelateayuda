"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ProfessionalCard } from "@/components/professional-card";
import {
  MapFilterSidebar,
  FILTER_ALL,
  type MapFilters,
} from "@/components/map-filter-sidebar";
import type { PublicProfessional } from "@/lib/types";
import { fetchJson } from "@/lib/fetch-json";

function buildProfessionalsQuery(filters: Pick<MapFilters, "q" | "category" | "state">): string {
  const params = new URLSearchParams();
  if (filters.category !== FILTER_ALL) params.set("category", filters.category);
  if (filters.state !== FILTER_ALL) params.set("state", filters.state);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  const qs = params.toString();
  return `/api/professionals${qs ? `?${qs}` : ""}`;
}

/** Directorio de ayudantes verificados con filtros y tarjetas con foto. */
export function ProfessionalsDirectory() {
  const [filters, setFilters] = useState<MapFilters>({
    q: "",
    type: FILTER_ALL,
    category: FILTER_ALL,
    state: FILTER_ALL,
    nearMe: false,
  });

  const query = useMemo(() => buildProfessionalsQuery(filters), [filters]);
  const { data, isLoading } = useSWR<{ professionals: PublicProfessional[] }>(query, fetchJson, {
    refreshInterval: 60_000,
  });
  const professionals = data?.professionals ?? [];

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10" data-testid="professionals-directory">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <MapFilterSidebar
          filters={filters}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          resultsCount={professionals.length}
          isLoading={isLoading}
          showTypeFilter={false}
          searchLabel="Busca por nombre o profesión"
          searchPlaceholder="Nombre, oficio o especialidad..."
          className="rounded-xl border bg-card p-5 shadow-sm lg:sticky lg:top-20 lg:self-start"
        />

        <div className="grid gap-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 w-full rounded-xl" />
              ))}
            </div>
          ) : professionals.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
              <p>No hay profesionales verificados con estos filtros.</p>
              <Link href="/registro" className="mt-2 block text-sm font-medium text-accent hover:underline">
                Publica tu primera ficha
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {professionals.map((professional) => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
