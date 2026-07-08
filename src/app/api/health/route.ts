import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const count = await prisma.helpListing.count();
    return NextResponse.json({ ok: true, listings: count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
