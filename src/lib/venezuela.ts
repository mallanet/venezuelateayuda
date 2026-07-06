/**
 * Estados de Venezuela con su capital, coordenadas aproximadas del centro
 * y municipios principales. Se usa para el selector de zona y como
 * respaldo de geocodificación cuando el usuario no ajusta el pin.
 */
export interface VenezuelaState {
  name: string;
  lat: number;
  lng: number;
  municipalities: string[];
}

export const VENEZUELA_CENTER = { lat: 8.0, lng: -66.0 };

export const VENEZUELA_STATES: VenezuelaState[] = [
  { name: "Amazonas", lat: 5.66, lng: -67.62, municipalities: ["Atures", "Autana", "Atabapo", "Manapiare", "Maroa", "Río Negro", "Alto Orinoco"] },
  { name: "Anzoátegui", lat: 10.13, lng: -64.68, municipalities: ["Simón Bolívar", "Sotillo", "Urbaneja", "Anaco", "Guanta", "Píritu", "Bruzual"] },
  { name: "Apure", lat: 7.89, lng: -67.47, municipalities: ["San Fernando", "Achaguas", "Biruaca", "Páez", "Pedro Camejo", "Rómulo Gallegos", "Muñoz"] },
  { name: "Aragua", lat: 10.25, lng: -67.6, municipalities: ["Girardot", "Mario Briceño Iragorry", "Santiago Mariño", "Sucre", "José Félix Ribas", "Libertador", "Zamora"] },
  { name: "Barinas", lat: 8.62, lng: -70.21, municipalities: ["Barinas", "Bolívar", "Ezequiel Zamora", "Pedraza", "Obispos", "Sosa", "Alberto Arvelo Torrealba"] },
  { name: "Bolívar", lat: 8.12, lng: -63.55, municipalities: ["Caroní", "Heres", "Piar", "Cedeño", "Sifontes", "Gran Sabana", "Angostura"] },
  { name: "Carabobo", lat: 10.18, lng: -68.0, municipalities: ["Valencia", "Naguanagua", "San Diego", "Libertador", "Los Guayos", "Puerto Cabello", "Guacara"] },
  { name: "Cojedes", lat: 9.66, lng: -68.58, municipalities: ["Ezequiel Zamora", "Tinaquillo", "Anzoátegui", "Girardot", "Lima Blanco", "Pao de San Juan Bautista", "Ricaurte"] },
  { name: "Delta Amacuro", lat: 9.06, lng: -62.05, municipalities: ["Tucupita", "Antonio Díaz", "Casacoima", "Pedernales"] },
  { name: "Distrito Capital", lat: 10.48, lng: -66.9, municipalities: ["Libertador"] },
  { name: "Falcón", lat: 11.4, lng: -69.67, municipalities: ["Miranda", "Carirubana", "Colina", "Zamora", "Falcón", "Los Taques", "Silva"] },
  { name: "Guárico", lat: 9.91, lng: -67.35, municipalities: ["Juan Germán Roscio", "Miranda", "Infante", "Ribas", "Zaraza", "Monagas", "Camaguán"] },
  { name: "La Guaira", lat: 10.6, lng: -66.93, municipalities: ["Vargas"] },
  { name: "Lara", lat: 10.07, lng: -69.32, municipalities: ["Iribarren", "Palavecino", "Torres", "Jiménez", "Morán", "Crespo", "Urdaneta"] },
  { name: "Mérida", lat: 8.59, lng: -71.14, municipalities: ["Libertador", "Campo Elías", "Sucre", "Alberto Adriani", "Tovar", "Santos Marquina", "Rangel"] },
  { name: "Miranda", lat: 10.24, lng: -66.4, municipalities: ["Baruta", "Chacao", "El Hatillo", "Sucre", "Guaicaipuro", "Zamora", "Plaza", "Cristóbal Rojas", "Los Salias", "Carrizal"] },
  { name: "Monagas", lat: 9.75, lng: -63.18, municipalities: ["Maturín", "Ezequiel Zamora", "Piar", "Caripe", "Cedeño", "Bolívar", "Punceres"] },
  { name: "Nueva Esparta", lat: 10.96, lng: -63.85, municipalities: ["Mariño", "García", "Maneiro", "Arismendi", "Díaz", "Gómez", "Marcano"] },
  { name: "Portuguesa", lat: 9.04, lng: -69.74, municipalities: ["Guanare", "Páez", "Araure", "Ospino", "Turén", "Esteller", "Sucre"] },
  { name: "Sucre", lat: 10.46, lng: -64.17, municipalities: ["Sucre", "Bermúdez", "Montes", "Ribero", "Mejía", "Cajigal", "Mariño"] },
  { name: "Táchira", lat: 7.77, lng: -72.22, municipalities: ["San Cristóbal", "Cárdenas", "Guásimos", "Junín", "Bolívar", "García de Hevia", "Torbes"] },
  { name: "Trujillo", lat: 9.37, lng: -70.44, municipalities: ["Trujillo", "Valera", "Boconó", "Pampán", "Carache", "Escuque", "Rafael Rangel"] },
  { name: "Yaracuy", lat: 10.34, lng: -68.74, municipalities: ["San Felipe", "Independencia", "Cocorote", "Bruzual", "Peña", "Nirgua", "Sucre"] },
  { name: "Zulia", lat: 10.65, lng: -71.65, municipalities: ["Maracaibo", "San Francisco", "Cabimas", "Lagunillas", "Mara", "Machiques de Perijá", "Santa Rita"] },
];

export function getState(name: string): VenezuelaState | undefined {
  return VENEZUELA_STATES.find((s) => s.name === name);
}
