/** ¿Es una foto real del usuario (no placeholder externo)? */
export function isCustomAvatarUrl(avatarUrl?: string | null): boolean {
  const url = avatarUrl?.trim();
  if (!url) return false;
  if (url.includes("pravatar.cc") || url.includes("ui-avatars.com")) return false;
  return (
    url.startsWith("/api/uploads/") ||
    url.startsWith("/uploads/") ||
    url.startsWith("data:image/") ||
    url.startsWith("https://") ||
    url.startsWith("http://")
  );
}

/** Iniciales para placeholder (máx. 2 letras). */
export function avatarInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

/**
 * URL de avatar: foto subida del perfil, o placeholder local con iniciales.
 * Nunca usa caras falsas de terceros (pravatar / ui-avatars).
 */
export function getAvatarUrl(
  displayName: string,
  avatarUrl?: string | null,
  seed?: string
): string {
  if (isCustomAvatarUrl(avatarUrl)) return avatarUrl!.trim();
  const name = encodeURIComponent(displayName.trim() || "Usuario");
  const key = encodeURIComponent((seed ?? displayName.trim()) || "usuario");
  return `/api/avatar?name=${name}&seed=${key}`;
}
