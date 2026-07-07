/** Estado virtual para ayudantes que viven fuera de Venezuela. */
export const ABROAD_STATE = "En el exterior";

/** Punto de anclaje en el mapa (Caribe, visible junto a Venezuela). */
export const ABROAD_MAP_LAT = 12.5;
export const ABROAD_MAP_LNG = -70;

export function isAbroadState(state: string): boolean {
  return state === ABROAD_STATE;
}

/** Coordenadas ligeramente dispersas para que los marcadores no se superpongan. */
export function abroadMapPosition(seed: string): { lat: number; lng: number } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return {
    lat: ABROAD_MAP_LAT + ((h % 17) - 8) * 0.06,
    lng: ABROAD_MAP_LNG + (((h >> 8) % 17) - 8) * 0.06,
  };
}

export function abroadLocationLabel(municipality: string): string {
  return `${municipality} · ${ABROAD_STATE}`;
}
