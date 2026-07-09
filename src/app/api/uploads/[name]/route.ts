import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { resolveUploadFilename, uploadsRoot } from "@/lib/uploads";

const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** Sirve fotos subidas desde el volumen persistente. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ name: string }> }
): Promise<NextResponse> {
  const { name } = await ctx.params;
  const safe = resolveUploadFilename(name);
  if (!safe) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = path.join(uploadsRoot(), safe);
    const data = await readFile(filePath);
    const ext = safe.split(".").pop() ?? "jpg";
    return new NextResponse(data, {
      headers: {
        "Content-Type": CONTENT_TYPE[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
