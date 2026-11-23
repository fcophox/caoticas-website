/**
 * Datos del marketplace.
 *
 * Dos fuentes, mismas funciones:
 *  - **Supabase** (el CMS), si están `SUPABASE_URL` y
 *    `SUPABASE_SERVICE_ROLE_KEY`. Ver `supabase-source.ts`.
 *  - **`catalog.json`**, si no: es lo que usa el sitio publicado mientras no
 *    haya un Supabase accesible desde internet.
 *
 * Las páginas sólo usan las funciones de este archivo.
 */
import { cache } from "react";
import catalog from "./catalog.json";
import { CAMPAIGN, CAMPAIGN_PRODUCTS_PER_FILTER } from "./campaign";
import { isSupabaseConfigured, loadSupabaseCatalog } from "./supabase-source";

export type MarketplaceProduct = {
  id: string;
  name: string;
  detail: string | null;
  description: string | null;
  price: number;
  salePrice: number | null;
  discountPercent: number | null;
  imageUrl: string | null;
  category: { slug: string; name: string } | null;
  createdAt: string;
};

/** Ficha completa: además de la portada, todas las imágenes en orden. */
export type MarketplaceProductDetail = MarketplaceProduct & { images: string[] };

export type MarketplaceCategory = {
  slug: string;
  name: string;
  /** Foto del círculo (ruta en /public o URL). Sin ella se usa ícono + degradado. */
  imagePath: string | null;
};

export type MarketplaceCollection = {
  slug: string;
  name: string;
  products: MarketplaceProduct[];
};

/** Lo que entrega cada fuente: productos con galería y a qué colecciones pertenecen. */
export type CatalogData = {
  products: (MarketplaceProductDetail & { collections: string[] })[];
  categories: MarketplaceCategory[];
  collections: { slug: string; name: string }[];
};

/** Imagen de marcador generada por `npm run images` (public/products). */
export const placeholderImage = (id: string, view = 0) => `/products/${id}-${view}.svg`;

export function salePriceFor(price: number, discountPercent: number | null): number | null {
  return discountPercent ? Math.round(price * (1 - discountPercent / 100)) : null;
}

function loadJsonCatalog(): CatalogData {
  const categories = new Map(catalog.categories.map((c) => [c.slug, c]));
  return {
    categories: catalog.categories.map((c) => ({ slug: c.slug, name: c.name, imagePath: c.imagePath })),
    collections: catalog.collections,
    products: catalog.products.map((raw) => {
      const category = raw.category ? categories.get(raw.category) : undefined;
      const images = Array.from({ length: raw.images }, (_, i) => placeholderImage(raw.id, i));
      return {
        id: raw.id,
        name: raw.name,
        detail: raw.detail || null,
        description: raw.description || null,
        price: raw.price,
        salePrice: salePriceFor(raw.price, raw.discountPercent),
        discountPercent: raw.discountPercent,
        imageUrl: images[0] ?? null,
        images,
        category: category ? { slug: category.slug, name: category.name } : null,
        createdAt: raw.createdAt,
        collections: raw.collections,
      };
    }),
  };
}

/**
 * Si Supabase no responde (p. ej. OrbStack apagado) el sitio no se cae: usa
 * `catalog.json` y deja el aviso en la consola del servidor.
 */
async function loadSupabaseOrJson(): Promise<CatalogData> {
  try {
    return await loadSupabaseCatalog();
  } catch (error) {
    console.warn(
      `[catálogo] Supabase no disponible (${error instanceof Error ? error.message : error}); usando catalog.json.`,
    );
    return loadJsonCatalog();
  }
}

/** Una carga por request (React `cache`): todas las funciones comparten el resultado. */
const loadCatalog = cache(async (): Promise<CatalogData> => {
  const data = isSupabaseConfigured() ? await loadSupabaseOrJson() : loadJsonCatalog();
  return {
    ...data,
    products: [...data.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
});

/** Para las listas no hace falta la galería completa. */
function summary(p: CatalogData["products"][number]): MarketplaceProduct {
  return {
    id: p.id,
    name: p.name,
    detail: p.detail,
    description: p.description,
    price: p.price,
    salePrice: p.salePrice,
    discountPercent: p.discountPercent,
    imageUrl: p.imageUrl,
    category: p.category,
    createdAt: p.createdAt,
  };
}

/** Catálogo completo, lo más nuevo primero. */
export async function listPublicProducts(): Promise<MarketplaceProduct[]> {
  return (await loadCatalog()).products.map(summary);
}

/** Ficha de un producto, o `null` si no existe. */
export async function getPublicProduct(productId: string): Promise<MarketplaceProductDetail | null> {
  const p = (await loadCatalog()).products.find((x) => x.id === productId);
  return p ? { ...summary(p), images: p.images } : null;
}

/** Más productos de la misma categoría para la ficha. */
export async function listRelatedProducts(
  product: MarketplaceProduct,
  limit = 6,
): Promise<MarketplaceProduct[]> {
  return (await loadCatalog()).products
    .filter((p) => p.id !== product.id && p.category?.slug === product.category?.slug)
    .slice(0, limit)
    .map(summary);
}

/** Categorías en su orden. */
export async function listPublicCategories(): Promise<MarketplaceCategory[]> {
  return (await loadCatalog()).categories;
}

/** Tope por pestaña: el carrusel es una vitrina, no el catálogo completo. */
const COLLECTION_LIMIT = 20;

/**
 * Colecciones especiales con sus productos. Las vacías no se devuelven, y la
 * de la campaña tampoco: tiene su propia sección (`getPublicCampaign`).
 */
export async function listPublicCollections(): Promise<MarketplaceCollection[]> {
  const { collections, products } = await loadCatalog();
  return collections
    .filter((c) => c.slug !== CAMPAIGN.collection)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      products: products
        .filter((p) => p.collections.includes(c.slug))
        .slice(0, COLLECTION_LIMIT)
        .map(summary),
    }))
    .filter((c) => c.products.length > 0);
}

export type CampaignFilter = { label: string; category: string; products: MarketplaceProduct[] };

export type PublicCampaign = {
  eyebrow: string;
  title: string;
  description: string;
  filters: CampaignFilter[];
};

/**
 * La campaña especial del home con los productos de cada subfiltro (ver
 * `campaign.ts`). `null` si la colección no tiene productos.
 */
export async function getPublicCampaign(): Promise<PublicCampaign | null> {
  const inCampaign = (await loadCatalog()).products.filter((p) =>
    p.collections.includes(CAMPAIGN.collection),
  );
  const filters = CAMPAIGN.filters
    .slice(0, 4)
    .map((f) => ({
      label: f.label,
      category: f.category,
      products: inCampaign
        .filter((p) => p.category?.slug === f.category)
        .slice(0, CAMPAIGN_PRODUCTS_PER_FILTER)
        .map(summary),
    }))
    .filter((f) => f.products.length > 0);
  if (filters.length === 0) return null;
  return { eyebrow: CAMPAIGN.eyebrow, title: CAMPAIGN.title, description: CAMPAIGN.description, filters };
}

/** Rutas a generar en el build. */
export async function allProductIds(): Promise<string[]> {
  return (await loadCatalog()).products.map((p) => p.id);
}
