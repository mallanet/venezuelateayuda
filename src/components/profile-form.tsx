"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category } from "@prisma/client";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StateMunicipalitySelect } from "@/components/state-municipality-select";
import { AbroadHelperFields } from "@/components/abroad-helper-fields";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { ABROAD_STATE, isAbroadState } from "@/lib/abroad";

interface ProfileFormValues {
  displayName: string;
  avatarUrl: string | null;
  phone: string;
  bio: string;
  state: string;
  municipality: string;
  radiusKm: number;
  categories: Category[];
}

export function ProfileForm({
  initial,
  role,
  userId,
}: {
  initial: ProfileFormValues;
  role: string;
  userId: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatarUrl);
  const [isAbroad, setIsAbroad] = useState(isAbroadState(initial.state));
  const [country, setCountry] = useState(isAbroadState(initial.state) ? initial.municipality : "");
  const [loading, setLoading] = useState(false);
  const canBeAbroad = role === "AYUDANTE";

  function toggleCategory(category: Category) {
    setValues((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((cat) => cat !== category)
        : [...prev.categories, category],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...values,
        state: isAbroad ? ABROAD_STATE : values.state,
        municipality: isAbroad ? country.trim() : values.municipality,
      };
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const locationReady = isAbroad ? country.trim().length >= 2 : Boolean(values.state && values.municipality);

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <AvatarUpload
        displayName={values.displayName}
        avatarUrl={avatarUrl}
        userId={userId}
        onChange={(url) => {
          setAvatarUrl(url);
          router.refresh();
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="displayName">Nombre</Label>
          <Input
            id="displayName"
            value={values.displayName}
            onChange={(e) => setValues((prev) => ({ ...prev, displayName: e.target.value }))}
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
            onChange={(e) => setValues((prev) => ({ ...prev, phone: e.target.value }))}
            maxLength={20}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Sobre mí (opcional)</Label>
        <Textarea
          id="bio"
          value={values.bio}
          onChange={(e) => setValues((prev) => ({ ...prev, bio: e.target.value }))}
          maxLength={500}
          rows={3}
          placeholder="Cuenta brevemente quién eres y cómo participas en la comunidad."
        />
      </div>

      {canBeAbroad && (
        <AbroadHelperFields
          isAbroad={isAbroad}
          country={country}
          onIsAbroadChange={(value) => {
            setIsAbroad(value);
            if (!value) {
              setCountry("");
              setValues((v) => ({ ...v, state: "", municipality: "" }));
            } else {
              setValues((v) => ({ ...v, state: ABROAD_STATE, municipality: "" }));
            }
          }}
          onCountryChange={setCountry}
        />
      )}

      {!isAbroad && (
        <StateMunicipalitySelect
          state={values.state}
          municipality={values.municipality}
          onStateChange={(state) => setValues((v) => ({ ...v, state, municipality: "" }))}
          onMunicipalityChange={(municipality) => setValues((v) => ({ ...v, municipality }))}
        />
      )}

      {!isAbroad && (
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
      )}

      <div className="grid gap-2">
        <Label>Categorías en las que participo</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 rounded-md border p-2 text-sm transition-colors hover:border-accent/30 hover:bg-accent/5"
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

      <Button type="submit" disabled={loading || !locationReady} className="justify-self-start">
        {loading && <LoaderCircle className="size-4 animate-spin" />}
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
