"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { useClientMounted } from "@/lib/use-client-mounted";
import type { PublicListing } from "@/lib/types";
import { CATEGORY_ICONS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/lib/categories";
import { formatListingMeta } from "@/lib/listing-meta";
import { abroadLocationLabel, isAbroadState } from "@/lib/abroad";
import { VENEZUELA_CENTER } from "@/lib/venezuela";
import { ZONE_COLORS, zoneRadiusMeters } from "@/lib/geo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapLegend } from "@/components/map/map-legend";
import "leaflet/dist/leaflet.css";

export interface MapUserLocation {
  lat: number;
  lng: number;
}

function markerIcon(listing: PublicListing) {
  const abroad = isAbroadState(listing.state);
  const borderColor = abroad
    ? "#FFCC00"
    : listing.type === "OFREZCO"
      ? ZONE_COLORS.OFREZCO.stroke
      : ZONE_COLORS.NECESITO.stroke;
  const safeUrl = `/_next/image?url=${encodeURIComponent(listing.authorAvatarUrl)}&w=64&q=75`;
  return L.divIcon({
    className: "",
    html: `<div style="width:44px;height:44px;border-radius:50%;border:3px solid ${borderColor};overflow:hidden;box-shadow:0 2px 8px rgba(14,107,203,.35);background:#fff"><img src="${safeUrl}" alt="" style="width:100%;height:100%;object-fit:cover" /></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

function userLocationIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#1C99FA;border:3px solid #fff;box-shadow:0 0 0 2px #1C99FA"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function zoneStyle(listing: PublicListing) {
  const abroad = isAbroadState(listing.state);
  const colors = abroad
    ? { stroke: "#FFCC00", fill: "#FFCC00" }
    : listing.type === "OFREZCO"
      ? ZONE_COLORS.OFREZCO
      : ZONE_COLORS.NECESITO;
  return {
    color: colors.stroke,
    fillColor: colors.fill,
    fillOpacity: listing.modality === "ONLINE" || abroad ? 0.14 : 0.22,
    weight: abroad ? 3 : 2,
    opacity: 0.85,
    dashArray: listing.modality === "ONLINE" || abroad ? "8 6" : undefined,
  };
}

function FitToListings({
  listings,
  focusId,
  userLocation,
}: {
  listings: PublicListing[];
  focusId?: string | null;
  userLocation?: MapUserLocation | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (focusId) {
      const focused = listings.find((listing) => listing.id === focusId);
      if (focused) {
        map.setView([focused.lat, focused.lng], 13, { animate: true });
        return;
      }
    }
    const points: [number, number][] = listings.map((l) => [l.lat, l.lng]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds.pad(0.15), { maxZoom: userLocation ? 11 : 12 });
    }
  }, [listings, focusId, userLocation, map]);
  return null;
}

interface ListingsMapProps {
  listings: PublicListing[];
  focusId?: string | null;
  userLocation?: MapUserLocation | null;
}

/** Mapa con zonas azul/rojo, marcadores y solapamiento visible por transparencia. */
export default function ListingsMap(props: ListingsMapProps) {
  const mounted = useClientMounted();

  if (!mounted) {
    return <div className="relative h-full min-h-[200px] w-full bg-muted/30" aria-hidden />;
  }

  return <ListingsMapContent {...props} />;
}

function ListingsMapContent({ listings, focusId, userLocation }: ListingsMapProps) {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[VENEZUELA_CENTER.lat, VENEZUELA_CENTER.lng]}
        zoom={6}
        className="h-full w-full"
        scrollWheelZoom
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FitToListings listings={listings} focusId={focusId} userLocation={userLocation} />

        {listings.map((listing) => (
          <Circle
            key={`zone-${listing.id}`}
            center={[listing.lat, listing.lng]}
            radius={zoneRadiusMeters(listing.radiusKm)}
            pathOptions={zoneStyle(listing)}
          />
        ))}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon()}>
            <Popup>Tu ubicación aproximada</Popup>
          </Marker>
        )}

        {listings.map((listing) => {
          const CategoryIcon = CATEGORY_ICONS[listing.category];
          return (
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
                      {isAbroadState(listing.state)
                        ? abroadLocationLabel(listing.municipality)
                        : `${listing.municipality}, ${listing.state}`}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={listing.type === "OFREZCO" ? "default" : "destructive"}
                  className="w-fit"
                >
                  {LISTING_TYPE_LABELS[listing.type]}
                </Badge>
                <strong>{listing.title}</strong>
                <span className="text-xs text-muted-foreground">
                  {isAbroadState(listing.state)
                    ? "Ayuda online desde el exterior"
                    : `Zona de acción: ~${listing.radiusKm} km`}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CategoryIcon className="size-3.5" />
                  {CATEGORY_LABELS[listing.category]}
                </span>
                <Badge variant="outline" className="w-fit text-[10px]">
                  {formatListingMeta(listing.quantity, listing.quantityUnit, listing.modality)}
                </Badge>
                <p className="m-0 text-sm">{listing.description}</p>
                <Button asChild size="sm" className="w-fit">
                  <Link href={`/ayuda/${listing.id}`}>Ver ficha</Link>
                </Button>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
      <MapLegend />
    </div>
  );
}
