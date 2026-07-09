"use client";

import { useEffect, useRef } from "react";

const GOFUNDME_WIDGET_URL =
  "https://www.gofundme.com/f/support-mallanet-secure-tech-for-all/widget/medium?attribution_id=sl%3A5670fe6a-0201-4034-a86a-f049c769ee99";

const GOFUNDME_CAMPAIGN_URL =
  "https://www.gofundme.com/f/support-mallanet-secure-tech-for-all";

/**
 * GoFundMe's embed.js only hydrates on DOMContentLoaded. Next.js loads scripts
 * after that, so we mount the iframe ourselves (same URL/UTM shape as embed.js).
 */
export function GoFundMeEmbed({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.querySelector("iframe")) return;

    const parsed = new URL(GOFUNDME_WIDGET_URL);
    parsed.searchParams.set("utm_content", window.location.hostname || "none");
    parsed.searchParams.set("utm_medium", "referral");
    parsed.searchParams.set("utm_source", "widget");

    const iframe = document.createElement("iframe");
    iframe.className = "gfm-embed-iframe";
    iframe.title = "GoFundMe — Apoya a Mallanet";
    iframe.width = "100%";
    iframe.height = "200";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("loading", "lazy");
    iframe.style.border = "none";
    iframe.style.display = "block";
    iframe.style.width = "100%";
    iframe.style.minHeight = "200px";
    iframe.src = `${parsed.toString()}#:~:tcm-regime=GDPR&tcm-prompt=Hidden`;
    host.appendChild(iframe);

    function onMessage(event: MessageEvent) {
      if (
        event.data &&
        event.data.type === "gfm-embed-widget-resize" &&
        typeof event.data.offsetHeight === "number" &&
        iframe.contentWindow === event.source
      ) {
        iframe.height = String(event.data.offsetHeight);
      }
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      iframe.remove();
    };
  }, []);

  return (
    <div className={className}>
      <a
        href={GOFUNDME_CAMPAIGN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-[#02A95C] px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover-lift hover:shadow-accent-glow"
      >
        Donar en GoFundMe
      </a>
      <div
        ref={hostRef}
        className="gfm-embed mt-3 min-h-[200px] w-full overflow-hidden rounded-xl"
        data-url={GOFUNDME_WIDGET_URL}
      />
    </div>
  );
}
