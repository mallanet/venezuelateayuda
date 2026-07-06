"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import type { PublicListing } from "@/lib/types";
import { CATEGORY_ICONS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
import { VENEZUELA_CENTER } from "@/lib/venezuela";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

function markerIcon(listing: PublicListing) {
  const borderColor = listing.type === "OFREZCO" ? "#059669" : "#e11d48";
  const safeUrl = listing.authorAvatarUrl.replace(/"/g, "&quot;");
  return L.divIcon({
    className: "",
    html: `<div style="width:44px;height:44px;border-radius:50%;border:3px solid ${borderColor};overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.35);background:#fff"><img src="${safeUrl}" alt="" style="width:100%;height:100%;object-fit:cover" /></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

function FitToListings({ listings, focusId }: { listings: PublicListing[]; focusId?: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (focusId) {
      const focused = listings.find((l) => l.id === focusId);
      if (focused) {
        map.setView([focused.lat, focused.lng], 14, { animate: true });
        return;
      }
    }
    if (listings.length > 0) {
      const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.2), { maxZoom: 12 });
    }
  }, [listings, focusId, map]);
  return null;
}

interface ListingsMapProps {
  listings: PublicListing[];
  focusId?: string | null;
}

/** Mapa con marcadores de avatar y popups con ficha resumida. */
export default function ListingsMap({ listings, focusId }: ListingsMapProps) {
  return (
    <MapContainer
      center={[VENEZUELA_CENTER.lat, VENEZUELA_CENTER.lng]}
      zoom={6}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <FitToListings listings={listings} focusId={focusId} />
      {listings.map((listing) => (
        <Marker key={listing.id} position={[listing.lat, listing.lng]} icon={markerIcon(listing)}>
          <Popup minWidth={260} maxWidth={300}>
            <div className="grid gap-2">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- Leaflet popup no monta next/image de forma fiable */}
                <img
                  src={listing.authorAvatarUrl}
                  alt={`Foto de ${listing.authorName}`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full border-2 border-primary object-cover"
                />
                <div className="grid gap-0.5">
                  <strong className="text-sm">{listing.authorName}</strong>
                  <span className="text-xs text-muted-foreground">
                    {listing.municipality}, {listing.state}
                  </span>
                </div>
              </div>
              <Badge variant={listing.type === "OFREZCO" ? "default" : "destructive"} className="w-fit">
                {LISTING_TYPE_LABELS[listing.type]}
              </Badge>
              <strong>{listing.title}</strong>
              <span className="text-xs text-muted-foreground">
                {CATEGORY_ICONS[listing.category]} {CATEGORY_LABELS[listing.category]}
              </span>
              <p className="m-0 text-sm">{listing.description}</p>
              <Button asChild size="sm" className="w-fit">
                <Link href={`/ayuda/${listing.id}`}>Ver ficha</Link>
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
