/**
 * Búsqueda de productos, compartida por el buscador del encabezado, la página
 * /buscar y el filtro del catálogo. Ignora mayúsculas y tildes ("poleron"
 * encuentra "Polerón") y exige que estén todas las palabras.
 */
import type { MarketplaceProduct } from "./data";

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type Searchable = Pick<MarketplaceProduct, "name" | "detail" | "description" | "category">;

function haystack(p: Searchable): string {
  return normalize([p.name, p.detail, p.description, p.category?.name].filter(Boolean).join(" "));
}

export function matchesQuery(p: Searchable, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = haystack(p);
  return words.every((w) => text.includes(w));
}

/** Coincidencias ordenadas: primero las que tienen la búsqueda en el nombre. */
export function searchProducts<T extends Searchable>(products: T[], query: string, limit?: number): T[] {
  const q = normalize(query);
  if (!q) return [];
  const hits = products.filter((p) => matchesQuery(p, q));
  const inName = (p: T) => (normalize(p.name).includes(q) ? 0 : 1);
  const sorted = [...hits].sort((a, b) => inName(a) - inName(b));
  return limit ? sorted.slice(0, limit) : sorted;
}
