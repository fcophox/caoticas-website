/**
 * Lectura del catálogo desde el Supabase del CMS (PostgREST, sin SDK).
 *
 * Variables (sólo servidor; nunca con prefijo NEXT_PUBLIC_):
 *   SUPABASE_URL               p. ej. http://127.0.0.1:54721 en local
 *   SUPABASE_SERVICE_ROLE_KEY  la clave de servicio: las tablas tienen RLS
 *                              sólo para usuarios autenticados del CMS
 *   SUPABASE_TENANT_SLUG       espacio del CMS cuyos productos se publican
 *                              (por defecto "demo")
 *
 * Sólo se publican productos activos (`is_active`) del espacio configurado.
 *
 * Imágenes: si el producto no tiene fotos en el CMS se usa el marcador de
 * `public/products/<id>-0.svg`, donde <id> es el nombre en forma de slug.
 */
import type { CatalogData } from "./data";

type Row = {
  id: string;
  name: string;
  detail: string | null;
  description: string | null;
  price: string | number;
  sale_price: string | number | null;
  discount_percent: string | number | null;
  created_at: string;
  category: { slug: string; name: string } | null;
  product_collections: { collection: { slug: string } | null }[];
};

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function rest<T>(path: string): Promise<T> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Supabase ${res.status} en ${path.split("?")[0]}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

/** "Mascarilla facial piña" → "mascarilla-facial-pina": URL legible y estable. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const toNumber = (v: string | number | null) => (v === null ? null : Number(v));

export async function loadSupabaseCatalog(): Promise<CatalogData> {
  const tenantSlug = process.env.SUPABASE_TENANT_SLUG || "demo";
  const [tenant] = await rest<{ id: string }[]>(
    `tenants?select=id&slug=eq.${encodeURIComponent(tenantSlug)}&deleted_at=is.null`,
  );
  if (!tenant) throw new Error(`Supabase: no existe el espacio "${tenantSlug}"`);

  const [rows, categories, collections] = await Promise.all([
    rest<Row[]>(
      `products?select=id,name,detail,description,price,sale_price,discount_percent,created_at,` +
        `category:categories(slug,name),product_collections(collection:collections(slug))` +
        `&tenant_id=eq.${tenant.id}&is_active=eq.true`,
    ),
    rest<{ slug: string; name: string; image_path: string | null }[]>(
      "categories?select=slug,name,image_path&order=position",
    ),
    rest<{ slug: string; name: string }[]>("collections?select=slug,name&order=position"),
  ]);

  const products = rows.map((r) => {
    const id = slugify(r.name);
    const price = Number(r.price);
    const salePrice = toNumber(r.sale_price);
    const images = [`/products/${id}-0.svg`];
    return {
      id,
      name: r.name,
      detail: r.detail,
      description: r.description,
      price,
      salePrice: salePrice !== null && salePrice < price ? salePrice : null,
      discountPercent: toNumber(r.discount_percent),
      imageUrl: images[0],
      images,
      category: r.category,
      createdAt: r.created_at,
      collections: r.product_collections.flatMap((pc) => (pc.collection ? [pc.collection.slug] : [])),
    };
  });

  return {
    products,
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, imagePath: c.image_path })),
    collections,
  };
}
