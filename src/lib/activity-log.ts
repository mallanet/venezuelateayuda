import { prisma } from "@/lib/prisma";
import { requestMeta, type RequestMeta } from "@/lib/request-meta";
import type { Prisma } from "@prisma/client";

export type ActivityEventType =
  | "register"
  | "login_success"
  | "login_failure"
  | "admin_login_success"
  | "admin_login_failure"
  | "profile_update"
  | "listing_create"
  | "admin_action";

type LogActivityInput = {
  eventType: ActivityEventType;
  userId?: string | null;
  email?: string | null;
  detail?: Prisma.InputJsonValue;
  meta?: RequestMeta;
};

export async function logActivity(req: Request, input: LogActivityInput): Promise<void> {
  const meta = input.meta ?? requestMeta(req);
  try {
    await prisma.activityLog.create({
      data: {
        eventType: input.eventType,
        userId: input.userId ?? null,
        email: input.email?.toLowerCase().trim() || null,
        ip: meta.ip,
        userAgent: meta.userAgent,
        browser: meta.browser,
        os: meta.os,
        device: meta.device,
        path: meta.path,
        httpMethod: meta.httpMethod,
        country: meta.country,
        detail: input.detail ?? undefined,
      },
    });
  } catch (err) {
    console.error("[activity-log]", input.eventType, err);
  }
}
