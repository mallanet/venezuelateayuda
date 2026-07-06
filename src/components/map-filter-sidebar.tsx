"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/categories";
import { VENEZUELA_STATES } from "@/lib/venezuela";

export const FILTER_ALL = "TODOS";

export interface MapFilters {
  q: string;
  type: string;
  category: string;
  state: string;
}

interface MapFilterSidebarProps {
  filters: MapFilters;
  onChange: (patch: Partial<MapFilters>) => void;
  resultsCount?: number;
  isLoading?: boolean;
  showTypeFilter?: boolean;
  className?: string;
}

/** Panel lateral de filtros estilo directorio para mapa y home. */
export function MapFilterSidebar({
  filters,
  onChange,
  resultsCount,
  isLoading,
  showTypeFilter = true,
  className,
}: MapFilterSidebarProps) {
  return (
    <aside
      className={className}
      data-testid="map-filter-sidebar"
      aria-label="Filtra tu búsqueda"
    >
      <h2 className="mb-4 text-lg font-semibold text-foreground">Filtra tu búsqueda</h2>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="filter-q">Busca por nombre</Label>
          <Input
            id="filter-q"
            placeholder="Busca por nombre..."
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            data-testid="filter-search"
          />
        </div>

        {showTypeFilter && (
          <div className="grid gap-2">
            <Label htmlFor="filter-type">Tipo de ayuda</Label>
            <Select value={filters.type} onValueChange={(type) => onChange({ type })}>
              <SelectTrigger id="filter-type" data-testid="filter-type">
                <SelectValue placeholder="Ofrezco y necesito" />
              </SelectTrigger>
              <SelectContent className="z-[1300]">
                <SelectItem value={FILTER_ALL}>Ofrezco y necesito</SelectItem>
                <SelectItem value="OFREZCO">Ofrezco ayuda</SelectItem>
                <SelectItem value="NECESITO">Necesito ayuda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="filter-category">Seleccione categoría</Label>
          <Select value={filters.category} onValueChange={(category) => onChange({ category })}>
            <SelectTrigger id="filter-category" data-testid="filter-category">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent className="z-[1300]">
              <SelectItem value={FILTER_ALL}>Todas las categorías</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="filter-state">Estado / zona</Label>
          <Select value={filters.state} onValueChange={(state) => onChange({ state })}>
            <SelectTrigger id="filter-state" data-testid="filter-state">
              <SelectValue placeholder="Todo el país" />
            </SelectTrigger>
            <SelectContent className="z-[1300]">
              <SelectItem value={FILTER_ALL}>Todo el país</SelectItem>
              {VENEZUELA_STATES.map((s) => (
                <SelectItem key={s.name} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {resultsCount !== undefined && (
          <p className="text-sm text-muted-foreground" data-testid="results-count">
            {isLoading ? "Cargando..." : `${resultsCount} resultados`}
          </p>
        )}
      </div>
    </aside>
  );
}

/** Construye la URL de la API de listings a partir de los filtros. */
export function buildListingsQuery(filters: MapFilters): string {
  const params = new URLSearchParams();
  if (filters.type !== FILTER_ALL) params.set("type", filters.type);
  if (filters.category !== FILTER_ALL) params.set("category", filters.category);
  if (filters.state !== FILTER_ALL) params.set("state", filters.state);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  const qs = params.toString();
  return `/api/listings${qs ? `?${qs}` : ""}`;
}
