"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VENEZUELA_STATES, getState } from "@/lib/venezuela";

interface StateMunicipalitySelectProps {
  state: string;
  municipality: string;
  onStateChange: (state: string) => void;
  onMunicipalityChange: (municipality: string) => void;
}

/**
 * Par de selectores dependientes Estado → Municipio con la división
 * político-territorial de Venezuela.
 */
export function StateMunicipalitySelect({
  state,
  municipality,
  onStateChange,
  onMunicipalityChange,
}: StateMunicipalitySelectProps) {
  const municipalities = getState(state)?.municipalities ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="estado">Estado</Label>
        <Select
          value={state}
          onValueChange={(value) => {
            onStateChange(value);
            onMunicipalityChange("");
          }}
        >
          <SelectTrigger id="estado" data-testid="select-estado" className="w-full">
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent className="z-[1300]">
            {VENEZUELA_STATES.map((state) => (
              <SelectItem key={state.name} value={state.name}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="municipio">Municipio</Label>
        <Select
          value={municipality}
          onValueChange={onMunicipalityChange}
          disabled={!state}
        >
          <SelectTrigger id="municipio" data-testid="select-municipio" className="w-full">
            <SelectValue placeholder="Selecciona un municipio" />
          </SelectTrigger>
          <SelectContent className="z-[1300]">
            {municipalities.map((municipio) => (
              <SelectItem key={municipio.name} value={municipio.name}>
                {municipio.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
