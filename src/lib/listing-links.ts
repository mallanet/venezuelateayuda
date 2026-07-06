import type { PublicListing } from "@/lib/types";

/** Enlace a Google Maps con direcciones hacia la ubicación aproximada de la ficha. */
export function getMapsDirectionsUrl(
  listing: Pick<PublicListing, "lat" | "lng">
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`;
}

/** Enlace wa.me con mensaje prefilled sobre la ficha. */
export function getWhatsAppContactUrl(
  listing: Pick<PublicListing, "title" | "municipality" | "state" | "authorDisplayName">
): string {
  const number =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "584241234567";
  const text = encodeURIComponent(
    `Hola ${listing.authorDisplayName}, vi tu ficha "${listing.title}" en Venezuela Te Ayuda (${listing.municipality}, ${listing.state}). Me gustaría comunicarme contigo.`
  );
  return `https://wa.me/${number}?text=${text}`;
}
