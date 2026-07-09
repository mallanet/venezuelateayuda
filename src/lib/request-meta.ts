export type RequestMeta = {
  ip: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  path: string | null;
  httpMethod: string | null;
  country: string | null;
};

function firstHeader(req: Request, name: string): string | null {
  const raw = req.headers.get(name);
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  return first || null;
}

/** Client IP behind reverse proxy: first hop of x-forwarded-for, else x-real-ip. */
export function clientIp(req: Request): string | null {
  return firstHeader(req, "x-forwarded-for") ?? firstHeader(req, "x-real-ip");
}

export function parseUserAgent(ua: string | null): {
  browser: string | null;
  os: string | null;
  device: string | null;
} {
  if (!ua) return { browser: null, os: null, device: null };

  let browser: string | null = null;
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/MSIE |Trident\//i.test(ua)) browser = "IE";

  let os: string | null = null;
  if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let device: string | null = "Desktop";
  if (/Mobile|Android.*Mobile|iPhone|iPod/i.test(ua)) device = "Mobile";
  else if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) device = "Tablet";

  return { browser, os, device };
}

export function requestMeta(req: Request): RequestMeta {
  const userAgent = req.headers.get("user-agent");
  const parsed = parseUserAgent(userAgent);
  let path: string | null = null;
  try {
    path = new URL(req.url).pathname;
  } catch {
    path = null;
  }
  return {
    ip: clientIp(req),
    userAgent,
    browser: parsed.browser,
    os: parsed.os,
    device: parsed.device,
    path,
    httpMethod: req.method,
    country: firstHeader(req, "cf-ipcountry") ?? firstHeader(req, "x-vercel-ip-country"),
  };
}
