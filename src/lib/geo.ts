/** Distancia en km entre dos puntos (fórmula de Haversine). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Ordena fichas por distancia ascendente respecto a un punto de referencia. */
export function sortByDistance<T extends { lat: number; lng: number }>(
  items: T[],
  origin: { lat: number; lng: number }
): T[] {
  return [...items].sort(
    (a, b) => distanceKm(origin, a) - distanceKm(origin, b)
  );
}

/** Metros de radio de zona según km del perfil (mínimo 3 km visual). */
export function zoneRadiusMeters(radiusKm: number): number {
  return Math.max(radiusKm, 3) * 1000;
}

/** Radio máximo para el filtro «Cerca de mí» en el mapa del home. */
export const NEAR_ME_RADIUS_KM = 50;

/** Conserva fichas dentro de un radio en km respecto a un punto. */
export function filterWithinRadius<T extends { lat: number; lng: number }>(
  items: T[],
  origin: { lat: number; lng: number },
  maxKm: number = NEAR_ME_RADIUS_KM
): T[] {
  return items.filter((item) => distanceKm(origin, item) <= maxKm);
}

export const ZONE_COLORS = {
  OFREZCO: { stroke: "#2563eb", fill: "#2563eb" },
  NECESITO: { stroke: "#dc2626", fill: "#dc2626" },
} as const;
