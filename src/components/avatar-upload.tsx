"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAvatarUrl, isCustomAvatarUrl } from "@/lib/avatar";

type AvatarUploadProps = {
  displayName: string;
  avatarUrl: string | null;
  userId: string;
  onChange: (url: string | null) => void;
};

/** Subida de foto de perfil con preview uniforme (cuadrado, object-cover). */
export function AvatarUpload({ displayName, avatarUrl, userId, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const preview = getAvatarUrl(displayName, avatarUrl, userId);
  const hasCustom = isCustomAvatarUrl(avatarUrl);

  async function upload(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.set("avatar", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo subir la foto");
        return;
      }
      onChange(data.avatarUrl ?? null);
      toast.success("Foto actualizada");
    } catch {
      toast.error("Error de conexión al subir la foto");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      if (!res.ok) {
        toast.error("No se pudo quitar la foto");
        return;
      }
      onChange(null);
      toast.success("Foto eliminada");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative size-24 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-soft">
        <Image
          src={preview}
          alt={`Foto de ${displayName}`}
          fill
          unoptimized
          className="object-cover object-center"
          sizes="96px"
        />
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-medium text-foreground">Foto de perfil</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          JPG, PNG o WebP · máx. 2 MB. Se recorta al centro para verse igual en el mapa y el home.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Camera className="size-3.5" aria-hidden />
            )}
            {hasCustom ? "Cambiar foto" : "Subir foto"}
          </Button>
          {hasCustom && (
            <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={remove}>
              <Trash2 className="size-3.5" aria-hidden />
              Quitar
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void upload(file);
          }}
        />
      </div>
    </div>
  );
}
