"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StateMunicipalitySelect } from "@/components/state-municipality-select";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";

interface ProfileFormValues {
  displayName: string;
  phone: string;
  bio: string;
  state: string;
  municipality: string;
  radiusKm: number;
  categories: Category[];
}

export function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(false);

  function toggleCategory(category: Category) {
    setValues((v) => ({
      ...v,
      categories: v.categories.includes(category)
        ? v.categories.filter((c) => c !== category)
        : [...v.categories, category],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo guardar el perfil");
        return;
      }
      toast.success("Perfil actualizado");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="displayName">Nombre</Label>
          <Input
            id="displayName"
            value={values.displayName}
            onChange={(e) => setValues((v) => ({ ...v, displayName: e.target.value }))}
            required
            minLength={2}
            maxLength={60}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Teléfono (privado)</Label>
          <Input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            maxLength={20}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Sobre mí (opcional)</Label>
        <Textarea
          id="bio"
          value={values.bio}
          onChange={(e) => setValues((v) => ({ ...v, bio: e.target.value }))}
          maxLength={500}
          rows={3}
          placeholder="Cuenta brevemente quién eres y cómo participas en la comunidad."
        />
      </div>

      <StateMunicipalitySelect
        state={values.state}
        municipality={values.municipality}
        onStateChange={(state) => setValues((v) => ({ ...v, state, municipality: "" }))}
        onMunicipalityChange={(municipality) => setValues((v) => ({ ...v, municipality }))}
      />

      <div className="grid gap-2">
        <Label htmlFor="radiusKm">Radio de acción: {values.radiusKm} km</Label>
        <Input
          id="radiusKm"
          type="range"
          min={1}
          max={100}
          value={values.radiusKm}
          onChange={(e) => setValues((v) => ({ ...v, radiusKm: Number(e.target.value) }))}
        />
      </div>

      <div className="grid gap-2">
        <Label>Categorías en las que participo</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 rounded-md border p-2 text-sm"
            >
              <Checkbox
                checked={values.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              {CATEGORY_LABELS[category]}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading || !values.state || !values.municipality} className="justify-self-start">
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
