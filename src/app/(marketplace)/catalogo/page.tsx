import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { listPublicCategories, listPublicProducts } from "@/lib/marketplace/data";
import { withCounts } from "../category-circles";
import { CatalogBrowser } from "./catalog-browser";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Todos los productos de Caóticas, con filtros por categoría y precio.",
};

type Param = string | string[] | undefined;

type Props = {
  searchParams: Promise<{ q?: Param; categoria?: Param; precio?: Param; ofertas?: Param }>;
};

function first(value: Param): string | null {
  return (Array.isArray(value) ? value[0] : value)?.trim() || null;
}

function all(value: Param): string[] {
  return (Array.isArray(value) ? value : value ? [value] : []).map((v) => v.trim()).filter(Boolean);
}

/** Catálogo completo: filtros a la izquierda, productos a la derecha. */
export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const [products, allCategories] = await Promise.all([listPublicProducts(), listPublicCategories()]);
  // Sólo las categorías que tienen productos.
  const categories = withCounts(allCategories, products);
  const initialFilters = {
    query: first(params.q)?.slice(0, 100) ?? "",
    categories: all(params.categoria),
    price: first(params.precio),
    onlyOffers: first(params.ofertas) === "1",
  };

  return (
    <>
      <section className="border-b bg-brand-gradient">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <nav aria-label="Ruta" className="flex items-center gap-1 text-sm text-foreground/75">
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground" aria-current="page">
              Catálogo
            </span>
          </nav>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Catálogo</h1>
          <p className="mt-2 text-foreground/75">
            {products.length} {products.length === 1 ? "producto" : "productos"} para tu rutina de
            cuidado personal.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* `key`: al llegar con otros filtros (p. ej. una búsqueda desde el
            encabezado estando ya aquí) el catálogo arranca de nuevo con ellos. */}
        <CatalogBrowser
          key={JSON.stringify(initialFilters)}
          products={products}
          categories={categories}
          initialFilters={initialFilters}
        />
      </div>
    </>
  );
}
