"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MiniMap = dynamic(() => import("./mini-map-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export function ListingMiniMap({ lat, lng }: { lat: number; lng: number }) {
  return <MiniMap lat={lat} lng={lng} />;
}
