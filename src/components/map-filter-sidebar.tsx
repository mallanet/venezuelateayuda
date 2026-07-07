"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/categories";
import { ABROAD_STATE } from "@/lib/abroad";
import { VENEZUELA_STATES } from "@/lib/venezuela";

export const FILTER_ALL = "TODOS";

export interface MapFilters {
  q: string;
  type: string;
  category: string;
  state: string;
  nearMe: boolean;
}

interface MapFilterSidebarProps {
  filters: MapFilters;
  onChange: (patch: Partial<MapFilters>) => void;
  resultsCount?: number;
  isLoading?: boolean;
  showTypeFilter?: boolean;
  showNearMeFilter?: boolean;
  locationReady?: boolean;
  hasGeolocation?: boolean;
  searchLabel?: string;
  searchPlaceholder?: string;
  className?: string;
}

/** Panel lateral de filtros estilo directorio para mapa y home. */
export function MapFilterSidebar({
  filters,
  onChange,
  resultsCount,
  isLoading,
  showTypeFilter = true,
  showNearMeFilter = false,
  locationReady = false,
  hasGeolocation = true,
  searchLabel = "Busca por nombre",
  searchPlaceholder = "Busca por nombre...",
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
          <Label htmlFor="filter-q">{searchLabel}</Label>
          <Input
            id="filter-q"
            placeholder={searchPlaceholder}
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            data-testid="filter-search"
          />
        </div>

        {showNearMeFilter && (
          <div className="grid gap-1.5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="filter-near-me"
                checked={filters.nearMe}
                onCheckedChange={(checked) => onChange({ nearMe: checked === true })}
                disabled={!hasGeolocation}
                data-testid="filter-near-me"
              />
              <Label htmlFor="filter-near-me" className="cursor-pointer font-normal">
                Cerca de mí
              </Label>
            </div>
            {filters.nearMe && !locationReady && hasGeolocation && (
              <p className="text-xs text-muted-foreground">Obteniendo tu ubicación…</p>
            )}
            {!hasGeolocation && (
              <p className="text-xs text-muted-foreground">
                Tu navegador no permite usar la ubicación.
              </p>
            )}
            {filters.nearMe && locationReady && (
              <p className="text-xs text-muted-foreground">Mostrando ayuda a menos de 50 km</p>
            )}
          </div>
        )}

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
              <SelectItem value={ABROAD_STATE}>En el exterior (online)</SelectItem>
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
