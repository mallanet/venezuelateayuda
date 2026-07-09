import { ABROAD_MAP_LAT, ABROAD_MAP_LNG, ABROAD_STATE, abroadMapPosition } from "@/lib/abroad";

/**
 * Estados de Venezuela con coordenadas del centro y municipios principales
 * (lat/lng aproximados del casco urbano). Se usa para el selector de zona y
 * como respaldo de geocodificación cuando el usuario no ajusta el pin.
 */
export interface Municipality {
  name: string;
  lat: number;
  lng: number;
}

export interface VenezuelaState {
  name: string;
  lat: number;
  lng: number;
  municipalities: Municipality[];
}

export const VENEZUELA_CENTER = { lat: 8.0, lng: -66.0 };

export const VENEZUELA_STATES: VenezuelaState[] = [
  {
    name: "Amazonas",
    lat: 5.66,
    lng: -67.62,
    municipalities: [
      { name: "Atures", lat: 5.66, lng: -67.62 },
      { name: "Autana", lat: 5.05, lng: -67.5 },
      { name: "Atabapo", lat: 4.05, lng: -67.7 },
      { name: "Manapiare", lat: 5.33, lng: -66.05 },
      { name: "Maroa", lat: 2.72, lng: -67.56 },
      { name: "Río Negro", lat: 1.92, lng: -67.05 },
      { name: "Alto Orinoco", lat: 3.15, lng: -65.55 },
    ],
  },
  {
    name: "Anzoátegui",
    lat: 10.13,
    lng: -64.68,
    municipalities: [
      { name: "Simón Bolívar", lat: 10.13, lng: -64.68 },
      { name: "Sotillo", lat: 10.21, lng: -64.63 },
      { name: "Urbaneja", lat: 10.23, lng: -64.56 },
      { name: "Anaco", lat: 9.44, lng: -64.47 },
      { name: "Guanta", lat: 10.24, lng: -64.59 },
      { name: "Píritu", lat: 10.04, lng: -65.04 },
      { name: "Bruzual", lat: 9.93, lng: -65.17 },
    ],
  },
  {
    name: "Apure",
    lat: 7.89,
    lng: -67.47,
    municipalities: [
      { name: "San Fernando", lat: 7.89, lng: -67.47 },
      { name: "Achaguas", lat: 7.78, lng: -68.23 },
      { name: "Biruaca", lat: 7.85, lng: -67.52 },
      { name: "Páez", lat: 7.25, lng: -70.85 },
      { name: "Pedro Camejo", lat: 6.8, lng: -67.55 },
      { name: "Rómulo Gallegos", lat: 7.55, lng: -69.35 },
      { name: "Muñoz", lat: 7.65, lng: -69.15 },
    ],
  },
  {
    name: "Aragua",
    lat: 10.25,
    lng: -67.6,
    municipalities: [
      { name: "Girardot", lat: 10.23, lng: -67.6 },
      { name: "Mario Briceño Iragorry", lat: 10.28, lng: -67.62 },
      { name: "Santiago Mariño", lat: 10.22, lng: -67.47 },
      { name: "Sucre", lat: 10.18, lng: -67.45 },
      { name: "José Félix Ribas", lat: 10.16, lng: -67.55 },
      { name: "Libertador", lat: 10.18, lng: -67.55 },
      { name: "Zamora", lat: 10.05, lng: -67.55 },
    ],
  },
  {
    name: "Barinas",
    lat: 8.62,
    lng: -70.21,
    municipalities: [
      { name: "Barinas", lat: 8.62, lng: -70.21 },
      { name: "Bolívar", lat: 8.85, lng: -70.5 },
      { name: "Ezequiel Zamora", lat: 7.85, lng: -71.15 },
      { name: "Pedraza", lat: 8.35, lng: -70.55 },
      { name: "Obispos", lat: 8.55, lng: -70.05 },
      { name: "Sosa", lat: 8.75, lng: -69.85 },
      { name: "Alberto Arvelo Torrealba", lat: 8.75, lng: -70.35 },
    ],
  },
  {
    name: "Bolívar",
    lat: 8.12,
    lng: -63.55,
    municipalities: [
      { name: "Caroní", lat: 8.31, lng: -62.72 },
      { name: "Heres", lat: 8.12, lng: -63.55 },
      { name: "Piar", lat: 8.05, lng: -62.4 },
      { name: "Cedeño", lat: 7.35, lng: -65.95 },
      { name: "Sifontes", lat: 6.85, lng: -61.85 },
      { name: "Gran Sabana", lat: 5.65, lng: -61.4 },
      { name: "Angostura", lat: 7.65, lng: -63.15 },
    ],
  },
  {
    name: "Carabobo",
    lat: 10.18,
    lng: -68.0,
    municipalities: [
      { name: "Valencia", lat: 10.18, lng: -68.0 },
      { name: "Naguanagua", lat: 10.24, lng: -68.01 },
      { name: "San Diego", lat: 10.25, lng: -67.95 },
      { name: "Libertador", lat: 10.15, lng: -68.05 },
      { name: "Los Guayos", lat: 10.18, lng: -67.93 },
      { name: "Puerto Cabello", lat: 10.47, lng: -68.01 },
      { name: "Guacara", lat: 10.23, lng: -67.88 },
    ],
  },
  {
    name: "Cojedes",
    lat: 9.66,
    lng: -68.58,
    municipalities: [
      { name: "Ezequiel Zamora", lat: 9.66, lng: -68.58 },
      { name: "Tinaquillo", lat: 9.92, lng: -68.32 },
      { name: "Anzoátegui", lat: 9.55, lng: -68.85 },
      { name: "Girardot", lat: 9.45, lng: -68.45 },
      { name: "Lima Blanco", lat: 9.75, lng: -68.45 },
      { name: "Pao de San Juan Bautista", lat: 9.55, lng: -68.15 },
      { name: "Ricaurte", lat: 9.35, lng: -68.65 },
    ],
  },
  {
    name: "Delta Amacuro",
    lat: 9.06,
    lng: -62.05,
    municipalities: [
      { name: "Tucupita", lat: 9.06, lng: -62.05 },
      { name: "Antonio Díaz", lat: 8.85, lng: -61.15 },
      { name: "Casacoima", lat: 8.55, lng: -61.85 },
      { name: "Pedernales", lat: 9.97, lng: -62.25 },
    ],
  },
  {
    name: "Distrito Capital",
    lat: 10.48,
    lng: -66.9,
    municipalities: [{ name: "Libertador", lat: 10.48, lng: -66.9 }],
  },
  {
    name: "Falcón",
    lat: 11.4,
    lng: -69.67,
    municipalities: [
      { name: "Miranda", lat: 11.4, lng: -69.67 },
      { name: "Carirubana", lat: 11.69, lng: -70.2 },
      { name: "Colina", lat: 11.45, lng: -69.55 },
      { name: "Zamora", lat: 11.25, lng: -69.35 },
      { name: "Falcón", lat: 11.85, lng: -69.95 },
      { name: "Los Taques", lat: 11.82, lng: -70.25 },
      { name: "Silva", lat: 10.95, lng: -68.3 },
    ],
  },
  {
    name: "Guárico",
    lat: 9.91,
    lng: -67.35,
    municipalities: [
      { name: "Juan Germán Roscio", lat: 9.91, lng: -67.35 },
      { name: "Miranda", lat: 9.65, lng: -67.05 },
      { name: "Infante", lat: 9.35, lng: -66.3 },
      { name: "Ribas", lat: 9.25, lng: -65.85 },
      { name: "Zaraza", lat: 9.35, lng: -65.32 },
      { name: "Monagas", lat: 9.55, lng: -67.55 },
      { name: "Camaguán", lat: 8.1, lng: -67.6 },
    ],
  },
  {
    name: "La Guaira",
    lat: 10.6,
    lng: -66.93,
    municipalities: [{ name: "Vargas", lat: 10.6, lng: -66.93 }],
  },
  {
    name: "Lara",
    lat: 10.07,
    lng: -69.32,
    municipalities: [
      { name: "Iribarren", lat: 10.07, lng: -69.32 },
      { name: "Palavecino", lat: 10.05, lng: -69.28 },
      { name: "Torres", lat: 10.15, lng: -69.85 },
      { name: "Jiménez", lat: 9.95, lng: -69.55 },
      { name: "Morán", lat: 9.75, lng: -69.85 },
      { name: "Crespo", lat: 10.25, lng: -69.15 },
      { name: "Urdaneta", lat: 10.35, lng: -69.55 },
    ],
  },
  {
    name: "Mérida",
    lat: 8.59,
    lng: -71.14,
    municipalities: [
      { name: "Libertador", lat: 8.59, lng: -71.14 },
      { name: "Campo Elías", lat: 8.55, lng: -71.25 },
      { name: "Sucre", lat: 8.95, lng: -70.85 },
      { name: "Alberto Adriani", lat: 8.6, lng: -71.65 },
      { name: "Tovar", lat: 8.33, lng: -71.75 },
      { name: "Santos Marquina", lat: 8.7, lng: -71.05 },
      { name: "Rangel", lat: 8.85, lng: -70.8 },
    ],
  },
  {
    name: "Miranda",
    lat: 10.24,
    lng: -66.4,
    municipalities: [
      { name: "Baruta", lat: 10.43, lng: -66.87 },
      { name: "Chacao", lat: 10.496, lng: -66.853 },
      { name: "El Hatillo", lat: 10.42, lng: -66.82 },
      { name: "Sucre", lat: 10.48, lng: -66.8 },
      { name: "Guaicaipuro", lat: 10.35, lng: -67.05 },
      { name: "Zamora", lat: 10.25, lng: -66.55 },
      { name: "Plaza", lat: 10.45, lng: -66.55 },
      { name: "Cristóbal Rojas", lat: 10.25, lng: -66.85 },
      { name: "Los Salias", lat: 10.42, lng: -66.95 },
      { name: "Carrizal", lat: 10.35, lng: -66.98 },
    ],
  },
  {
    name: "Monagas",
    lat: 9.75,
    lng: -63.18,
    municipalities: [
      { name: "Maturín", lat: 9.75, lng: -63.18 },
      { name: "Ezequiel Zamora", lat: 9.55, lng: -63.55 },
      { name: "Piar", lat: 9.95, lng: -63.45 },
      { name: "Caripe", lat: 10.17, lng: -63.5 },
      { name: "Cedeño", lat: 9.65, lng: -63.85 },
      { name: "Bolívar", lat: 9.85, lng: -63.05 },
      { name: "Punceres", lat: 10.05, lng: -63.15 },
    ],
  },
  {
    name: "Nueva Esparta",
    lat: 10.96,
    lng: -63.85,
    municipalities: [
      { name: "Mariño", lat: 10.96, lng: -63.85 },
      { name: "García", lat: 11.02, lng: -63.92 },
      { name: "Maneiro", lat: 10.95, lng: -63.82 },
      { name: "Arismendi", lat: 11.05, lng: -63.85 },
      { name: "Díaz", lat: 10.98, lng: -64.15 },
      { name: "Gómez", lat: 11.08, lng: -63.95 },
      { name: "Marcano", lat: 11.05, lng: -63.9 },
    ],
  },
  {
    name: "Portuguesa",
    lat: 9.04,
    lng: -69.74,
    municipalities: [
      { name: "Guanare", lat: 9.04, lng: -69.74 },
      { name: "Páez", lat: 9.55, lng: -69.2 },
      { name: "Araure", lat: 9.57, lng: -69.22 },
      { name: "Ospino", lat: 9.3, lng: -69.45 },
      { name: "Turén", lat: 9.25, lng: -69.1 },
      { name: "Esteller", lat: 9.35, lng: -69.15 },
      { name: "Sucre", lat: 9.15, lng: -69.55 },
    ],
  },
  {
    name: "Sucre",
    lat: 10.46,
    lng: -64.17,
    municipalities: [
      { name: "Sucre", lat: 10.46, lng: -64.17 },
      { name: "Bermúdez", lat: 10.57, lng: -63.25 },
      { name: "Montes", lat: 10.25, lng: -63.95 },
      { name: "Ribero", lat: 10.45, lng: -63.5 },
      { name: "Mejía", lat: 10.55, lng: -64.15 },
      { name: "Cajigal", lat: 10.55, lng: -62.95 },
      { name: "Mariño", lat: 10.65, lng: -63.25 },
    ],
  },
  {
    name: "Táchira",
    lat: 7.77,
    lng: -72.22,
    municipalities: [
      { name: "San Cristóbal", lat: 7.77, lng: -72.22 },
      { name: "Cárdenas", lat: 7.82, lng: -72.25 },
      { name: "Guásimos", lat: 7.85, lng: -72.2 },
      { name: "Junín", lat: 7.55, lng: -72.25 },
      { name: "Bolívar", lat: 7.8, lng: -72.45 },
      { name: "García de Hevia", lat: 8.35, lng: -72.25 },
      { name: "Torbes", lat: 7.7, lng: -72.25 },
    ],
  },
  {
    name: "Trujillo",
    lat: 9.37,
    lng: -70.44,
    municipalities: [
      { name: "Trujillo", lat: 9.37, lng: -70.44 },
      { name: "Valera", lat: 9.32, lng: -70.6 },
      { name: "Boconó", lat: 9.25, lng: -70.25 },
      { name: "Pampán", lat: 9.4, lng: -70.5 },
      { name: "Carache", lat: 9.65, lng: -70.25 },
      { name: "Escuque", lat: 9.25, lng: -70.7 },
      { name: "Rafael Rangel", lat: 9.45, lng: -70.55 },
    ],
  },
  {
    name: "Yaracuy",
    lat: 10.34,
    lng: -68.74,
    municipalities: [
      { name: "San Felipe", lat: 10.34, lng: -68.74 },
      { name: "Independencia", lat: 10.35, lng: -68.75 },
      { name: "Cocorote", lat: 10.32, lng: -68.78 },
      { name: "Bruzual", lat: 10.25, lng: -68.85 },
      { name: "Peña", lat: 10.25, lng: -68.9 },
      { name: "Nirgua", lat: 10.15, lng: -68.55 },
      { name: "Sucre", lat: 10.4, lng: -68.65 },
    ],
  },
  {
    name: "Zulia",
    lat: 10.65,
    lng: -71.65,
    municipalities: [
      { name: "Maracaibo", lat: 10.65, lng: -71.65 },
      { name: "San Francisco", lat: 10.55, lng: -71.65 },
      { name: "Cabimas", lat: 10.4, lng: -71.45 },
      { name: "Lagunillas", lat: 10.15, lng: -71.25 },
      { name: "Mara", lat: 10.85, lng: -71.85 },
      { name: "Machiques de Perijá", lat: 10.05, lng: -72.55 },
      { name: "Santa Rita", lat: 10.55, lng: -71.5 },
    ],
  },
];

export function getState(name: string): VenezuelaState | undefined {
  if (name === ABROAD_STATE) {
    return { name: ABROAD_STATE, lat: ABROAD_MAP_LAT, lng: ABROAD_MAP_LNG, municipalities: [] };
  }
  return VENEZUELA_STATES.find((s) => s.name === name);
}

/**
 * Coordenadas de zona: municipio si existe, si no el centro del estado.
 * Exterior → ancla Caribe con dispersión determinística (seed).
 */
export function getZoneCoords(
  stateName: string,
  municipalityName?: string | null,
  seed?: string
): { lat: number; lng: number } | null {
  if (stateName === ABROAD_STATE) {
    return abroadMapPosition(seed ?? municipalityName ?? stateName);
  }
  const state = getState(stateName);
  if (!state) return null;
  const muni = municipalityName
    ? state.municipalities.find((m) => m.name === municipalityName)
    : undefined;
  return { lat: (muni ?? state).lat, lng: (muni ?? state).lng };
}
