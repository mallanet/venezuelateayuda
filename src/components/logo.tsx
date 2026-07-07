"use client";

import Image from "next/image";

type LogoProps = {
  className?: string;
  size?: number;
  /** Texto alternativo; vacío = decorativo (aria-hidden). */
  alt?: string;
};

const LOGO_RATIO = 510 / 477;

/** Marca de Venezuela Te Ayuda (logoo.svg) escalada por altura. */
export function Logo({ className, size = 40, alt = "" }: LogoProps) {
  const width = Math.round(size * LOGO_RATIO);
  return (
    <Image
      src="/logoo.svg"
      alt={alt}
      width={width}
      height={size}
      className={className}
      // SVG: se sirve sin pasar por el optimizador de imágenes.
      unoptimized
      priority
      draggable={false}
      aria-hidden={alt === "" ? true : undefined}
    />
  );
}

type LogotypeProps = {
  className?: string;
  size?: number;
  showTagline?: boolean;
};

export function Logotype({ className, size = 40, showTagline = false }: LogotypeProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Logo size={size} />
      <span className="flex flex-col leading-tight">
        <span className="font-heading text-base font-semibold text-primary">
          Venezuela Te Ayuda
        </span>
        {showTagline && (
          <span className="text-xs font-medium text-accent">Mapa de ayuda mutua</span>
        )}
      </span>
    </span>
  );
}
