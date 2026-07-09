"use client";

import { useCallback, useEffect, useState } from "react";
import { useHasGeolocation } from "@/lib/use-client-mounted";

export type GeoPermission = "unknown" | "granted" | "denied" | "unsupported";

export type UserCoords = { lat: number; lng: number };

export function useUserLocation(options?: { requestOnMount?: boolean }) {
  const hasGeolocation = useHasGeolocation();
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [permission, setPermission] = useState<GeoPermission>(
    hasGeolocation ? "unknown" : "unsupported"
  );
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = useCallback(() => {
    if (!hasGeolocation) {
      setPermission("unsupported");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPermission("granted");
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermission("denied");
          setCoords(null);
          return;
        }
        setPermission("unknown");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  }, [hasGeolocation]);

  useEffect(() => {
    if (!hasGeolocation || !navigator.permissions?.query) return;
    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (cancelled) return;
        if (status.state === "granted") setPermission("granted");
        if (status.state === "denied") setPermission("denied");
        status.onchange = () => {
          if (status.state === "granted") setPermission("granted");
          if (status.state === "denied") {
            setPermission("denied");
            setCoords(null);
          }
          if (status.state === "prompt") setPermission("unknown");
        };
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hasGeolocation]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount option explicitly requests browser geolocation.
    if (options?.requestOnMount) requestLocation();
  }, [options?.requestOnMount, requestLocation]);

  return {
    coords,
    permission,
    isLocating,
    hasGeolocation,
    requestLocation,
    locationReady: !!coords,
  };
}
