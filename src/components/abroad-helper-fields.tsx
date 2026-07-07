"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AbroadHelperFieldsProps {
  isAbroad: boolean;
  country: string;
  onIsAbroadChange: (value: boolean) => void;
  onCountryChange: (value: string) => void;
  disabled?: boolean;
}

/** Campos para ayudantes en el exterior que ofrecen ayuda online. */
export function AbroadHelperFields({
  isAbroad,
  country,
  onIsAbroadChange,
  onCountryChange,
  disabled,
}: AbroadHelperFieldsProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
      <div className="flex items-start gap-2">
        <Checkbox
          id="is-abroad"
          checked={isAbroad}
          onCheckedChange={(v) => onIsAbroadChange(v === true)}
          disabled={disabled}
          data-testid="checkbox-abroad"
        />
        <div className="grid gap-1">
          <Label htmlFor="is-abroad" className="cursor-pointer font-medium leading-snug">
            Vivo fuera de Venezuela y ofrezco ayuda online
          </Label>
          <p className="text-xs text-muted-foreground">
            Tu perfil aparecerá en el mapa como ayuda internacional en línea.
          </p>
        </div>
      </div>
      {isAbroad && (
        <div className="grid gap-2">
          <Label htmlFor="country">País de residencia</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            placeholder="Ej.: Colombia, España, Estados Unidos"
            required={isAbroad}
            minLength={2}
            maxLength={80}
            disabled={disabled}
            data-testid="input-country"
          />
        </div>
      )}
    </div>
  );
}
