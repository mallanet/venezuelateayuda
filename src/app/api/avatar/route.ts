import { NextResponse } from "next/server";
import { avatarInitials } from "@/lib/avatar";

/** Placeholder SVG con iniciales — sin fotos hardcodeadas de terceros. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim() || "Usuario";
  const seed = searchParams.get("seed")?.trim() || name;
  const initials = avatarInitials(name);

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  // Paleta Mallanet (azules)
  const palettes = [
    ["#0B1F33", "#3B82F6"],
    ["#102A44", "#38BDF8"],
    ["#0F2740", "#60A5FA"],
    ["#12304F", "#0EA5E9"],
  ] as const;
  const [bg, fg] = palettes[hash % palettes.length]!;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-label="${escapeXml(name)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${fg}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <text x="200" y="215" text-anchor="middle" dominant-baseline="middle"
    font-family="Nunito, system-ui, sans-serif" font-size="140" font-weight="800"
    fill="white">${escapeXml(initials)}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
