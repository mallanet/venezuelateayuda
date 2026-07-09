import path from "path";

export const UPLOAD_MAX_BYTES = 2 * 1024 * 1024;

export const UPLOAD_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Directorio persistente (volumen Docker) o fallback local. */
export function uploadsRoot(): string {
  return process.env.UPLOADS_DIR?.trim() || path.join(process.cwd(), "public", "uploads");
}

export function avatarPublicPath(userId: string, ext: string): string {
  return `/api/uploads/${userId}.${ext}`;
}

export function resolveUploadFilename(name: string): string | null {
  if (!/^[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(name)) return null;
  return name;
}
