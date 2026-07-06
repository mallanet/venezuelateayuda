/** URL de avatar: usa la foto del perfil o genera una con iniciales (ui-avatars). */
export function getAvatarUrl(displayName: string, avatarUrl?: string | null): string {
  if (avatarUrl?.trim()) return avatarUrl.trim();
  const name = encodeURIComponent(displayName.trim() || "Usuario");
  return `https://ui-avatars.com/api/?name=${name}&background=0d9488&color=fff&size=256&bold=true`;
}
