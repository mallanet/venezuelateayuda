/** Fetcher compartido para useSWR: pide la URL y devuelve el JSON. */
export const fetchJson = (url: string) => fetch(url).then((r) => r.json());
