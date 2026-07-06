/** Índice estable 1–70 para pravatar a partir de un identificador. */
function stablePortraitIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (hash % 70) + 1;
}

/** URL de avatar: foto del perfil o retrato realista (pravatar) en lugar de iniciales. */
export function getAvatarUrl(displayName: string, avatarUrl?: string | null, seed?: string): string {
  const custom = avatarUrl?.trim();
  if (custom && !custom.includes("ui-avatars.com")) return custom;
  const key = (seed ?? displayName.trim()) || "usuario";
  return `https://i.pravatar.cc/400?img=${stablePortraitIndex(key)}`;
}
