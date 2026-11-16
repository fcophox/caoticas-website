/**
 * Datos del marketplace.
 *
 * Hoy salen de `catalog.json` (contenido de ejemplo) y de las imágenes de
 * `public/products/`. Las páginas sólo usan las funciones de este archivo, así
 * que para conectar una API o un CMS basta con reimplementarlas aquí con las
 * mismas firmas: son `async` justamente para eso.
 */
import catalog from "./catalog.json";

export type MarketplaceProduct = {
  id: string;
  name: string;
  detail: string | null;
  description: string | null;
  price: number;
  salePrice: number | null;
  discountPercent: number | null;
  imageUrl: string | null;
  store: { slug: string; name: string };
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

type RawProduct = (typeof catalog.products)[number];

const stores = new Map(catalog.stores.map((s) => [s.slug, s]));
const categories = new Map(catalog.categories.map((c) => [c.slug, c]));

const imagePath = (id: string, view: number) => `/products/${id}-${view}.svg`;

function toProduct(raw: RawProduct): MarketplaceProductDetail {
  const discount = raw.discountPercent;
  const salePrice = discount ? Math.round(raw.price * (1 - discount / 100)) : null;
  const store = stores.get(raw.store) ?? { slug: raw.store, name: raw.store };
  const category = raw.category ? categories.get(raw.category) : undefined;
  const images = Array.from({ length: raw.images }, (_, i) => imagePath(raw.id, i));

  return {
    id: raw.id,
    name: raw.name,
    detail: raw.detail || null,
    description: raw.description || null,
    price: raw.price,
    salePrice,
    discountPercent: discount,
    imageUrl: images[0] ?? null,
    images,
    store: { slug: store.slug, name: store.name },
    category: category ? { slug: category.slug, name: category.name } : null,
    createdAt: raw.createdAt,
  };
}

const PRODUCTS = catalog.products
  .map(toProduct)
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

/** Para las listas no hace falta la galería completa. */
function summary(p: MarketplaceProductDetail): MarketplaceProduct {
  const rest: Partial<MarketplaceProductDetail> = { ...p };
  delete rest.images;
  return rest as MarketplaceProduct;
}

/** Catálogo completo, lo más nuevo primero. */
export async function listPublicProducts(): Promise<MarketplaceProduct[]> {
  return PRODUCTS.map(summary);
}

/** Ficha de un producto, o `null` si no existe. */
export async function getPublicProduct(productId: string): Promise<MarketplaceProductDetail | null> {
  return PRODUCTS.find((p) => p.id === productId) ?? null;
}

/** Más productos de la misma tienda para la ficha. */
export async function listRelatedProducts(
  product: MarketplaceProduct,
  limit = 6,
): Promise<MarketplaceProduct[]> {
  return PRODUCTS.filter((p) => p.store.slug === product.store.slug && p.id !== product.id)
    .slice(0, limit)
    .map(summary);
}

/** Categorías en su orden. */
export async function listPublicCategories(): Promise<MarketplaceCategory[]> {
  return catalog.categories.map((c) => ({ slug: c.slug, name: c.name, imagePath: c.imagePath }));
}

/** Tope por pestaña: el carrusel es una vitrina, no el catálogo completo. */
const COLLECTION_LIMIT = 20;

/** Colecciones especiales con sus productos. Las vacías no se devuelven. */
export async function listPublicCollections(): Promise<MarketplaceCollection[]> {
  return catalog.collections
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      products: catalog.products
        .filter((p) => p.collections.includes(c.slug))
        .map((raw) => PRODUCTS.find((p) => p.id === raw.id)!)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, COLLECTION_LIMIT)
        .map(summary),
    }))
    .filter((c) => c.products.length > 0);
}

/** Rutas a generar en el build: el sitio entero puede ser estático. */
export function allProductIds() {
  return PRODUCTS.map((p) => p.id);
}

export function allCategorySlugs() {
  return catalog.categories.map((c) => c.slug);
}
