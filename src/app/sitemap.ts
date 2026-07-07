import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const ROUTES: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: "daily", priority: 1 },
  { url: `${SITE_URL}/mapa`, changeFrequency: "hourly", priority: 0.9 },
  { url: `${SITE_URL}/profesionales`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${SITE_URL}/registro`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.4 },
  { url: `${SITE_URL}/legal/terminos`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${SITE_URL}/legal/privacidad`, changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES;
}
