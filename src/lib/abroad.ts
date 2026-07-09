/** Estado virtual para ayudantes que viven fuera de Venezuela. */
export const ABROAD_STATE = "En el exterior";

/** Fallback si el país no se reconoce (Caribe, visible junto a Venezuela). */
export const ABROAD_MAP_LAT = 12.5;
export const ABROAD_MAP_LNG = -70;

type CountryPin = { aliases: string[]; lat: number; lng: number };

/**
 * Capital / área urbana aproximada por país (diaspora).
 * aliases: forma normalizada (sin acentos, minúsculas).
 */
const ABROAD_COUNTRY_PINS: CountryPin[] = [
  { aliases: ["ecuador"], lat: -0.1807, lng: -78.4678 },
  { aliases: ["colombia"], lat: 4.711, lng: -74.0721 },
  { aliases: ["espana", "spain"], lat: 40.4168, lng: -3.7038 },
  {
    aliases: ["estados unidos", "ee uu", "usa", "united states", "eeuu"],
    lat: 38.9072,
    lng: -77.0369,
  },
  { aliases: ["peru"], lat: -12.0464, lng: -77.0428 },
  { aliases: ["panama"], lat: 8.9824, lng: -79.5199 },
  { aliases: ["chile"], lat: -33.4489, lng: -70.6693 },
  { aliases: ["argentina"], lat: -34.6037, lng: -58.3816 },
  { aliases: ["mexico"], lat: 19.4326, lng: -99.1332 },
  { aliases: ["brasil", "brazil"], lat: -15.7939, lng: -47.8828 },
  { aliases: ["canada"], lat: 45.4215, lng: -75.6972 },
  { aliases: ["portugal"], lat: 38.7223, lng: -9.1393 },
  { aliases: ["italia", "italy"], lat: 41.9028, lng: -12.4964 },
  { aliases: ["francia", "france"], lat: 48.8566, lng: 2.3522 },
  { aliases: ["alemania", "germany"], lat: 52.52, lng: 13.405 },
  {
    aliases: ["reino unido", "united kingdom", "inglaterra", "uk"],
    lat: 51.5074,
    lng: -0.1278,
  },
  { aliases: ["republica dominicana", "dominican republic"], lat: 18.4861, lng: -69.9312 },
  { aliases: ["costa rica"], lat: 9.9281, lng: -84.0907 },
  { aliases: ["uruguay"], lat: -34.9011, lng: -56.1645 },
  { aliases: ["bolivia"], lat: -16.5, lng: -68.15 },
  { aliases: ["paraguay"], lat: -25.2637, lng: -57.5759 },
  { aliases: ["aruba"], lat: 12.5211, lng: -69.9683 },
  { aliases: ["curacao", "curazao"], lat: 12.1696, lng: -68.99 },
  { aliases: ["trinidad", "trinidad y tobago"], lat: 10.6918, lng: -61.2225 },
];

export function isAbroadState(state: string): boolean {
  return state === ABROAD_STATE;
}

function normalizeCountryText(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[._]/g, " ")
    .replace(/[^a-z0-9\s,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Centro aproximado del país a partir del texto guardado en municipality. */
export function abroadCountryCoords(country: string): { lat: number; lng: number } {
  const key = normalizeCountryText(country);
  if (!key) return { lat: ABROAD_MAP_LAT, lng: ABROAD_MAP_LNG };

  const segments = [key];
  const comma = key.lastIndexOf(",");
  if (comma >= 0) {
    const tail = key.slice(comma + 1).trim();
    if (tail) segments.unshift(tail);
  }

  let best: { lat: number; lng: number; len: number } | null = null;
  for (const segment of segments) {
    for (const pin of ABROAD_COUNTRY_PINS) {
      for (const alias of pin.aliases) {
        if (segment === alias || segment.includes(alias) || key.includes(alias)) {
          if (!best || alias.length > best.len) {
            best = { lat: pin.lat, lng: pin.lng, len: alias.length };
          }
        }
      }
    }
  }

  return best ? { lat: best.lat, lng: best.lng } : { lat: ABROAD_MAP_LAT, lng: ABROAD_MAP_LNG };
}

/** Coordenadas del país con jitter determinístico para que los marcadores no se superpongan. */
export function abroadMapPosition(country: string, seed = country): { lat: number; lng: number } {
  const base = abroadCountryCoords(country);
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return {
    lat: base.lat + ((h % 17) - 8) * 0.06,
    lng: base.lng + (((h >> 8) % 17) - 8) * 0.06,
  };
}

export function abroadLocationLabel(municipality: string): string {
  return `${municipality} · ${ABROAD_STATE}`;
}
