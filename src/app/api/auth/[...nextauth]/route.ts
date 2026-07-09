import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";

export const { GET } = handlers;

/**
 * authorize() has no Request/headers — capture IP/UA here on credential callbacks.
 */
export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicLogin = path.endsWith("/callback/credentials");
  const isAdminLogin = path.endsWith("/callback/admin-credentials");

  let email: string | null = null;
  if (isPublicLogin || isAdminLogin) {
    try {
      const form = await req.clone().formData();
      email = String(form.get("email") ?? "")
        .toLowerCase()
        .trim() || null;
    } catch {
      email = null;
    }
  }

  const res = await handlers.POST(req);

  if (isPublicLogin || isAdminLogin) {
    let failed = !res.ok;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      try {
        const body = (await res.clone().json()) as { error?: unknown };
        failed = Boolean(body?.error);
      } catch {
        // keep status-based failed
      }
    } else if (res.status >= 300 && res.status < 400) {
      failed = false;
    }

    let userId: string | null = null;
    if (!failed && email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      userId = user?.id ?? null;
    }

    await logActivity(req, {
      eventType: isAdminLogin
        ? failed
          ? "admin_login_failure"
          : "admin_login_success"
        : failed
          ? "login_failure"
          : "login_success",
      userId,
      email,
    });
  }

  return res;
}
