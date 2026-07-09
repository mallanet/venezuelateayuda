"use client";

import Script from "next/script";

const GOFUNDME_WIDGET_URL =
  "https://www.gofundme.com/f/support-mallanet-secure-tech-for-all/widget/medium?attribution_id=sl%3A5670fe6a-0201-4034-a86a-f049c769ee99";

/** Widget oficial GoFundMe (Mallanet). */
export function GoFundMeEmbed({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="gfm-embed" data-url={GOFUNDME_WIDGET_URL} />
      <Script src="https://www.gofundme.com/static/js/embed.js" strategy="lazyOnload" />
    </div>
  );
}
