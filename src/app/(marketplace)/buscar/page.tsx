import type { Metadata } from "next";
import { listPublicProducts } from "@/lib/marketplace/data";
import { MarketplaceCatalog } from "../marketplace-catalog";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

function readQuery(q: string | string[] | undefined): string {
  return (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = readQuery((await searchParams).q);
  return {
    title: q ? `Resultados para “${q}”` : "Buscar",
    robots: { index: false },
  };
}

/** Resultados del buscador del encabezado. Usa el mismo catálogo con filtros. */
export default async function SearchPage({ searchParams }: Props) {
  const q = readQuery((await searchParams).q);
  const products = await listPublicProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      {/* `key` reinicia los filtros al hacer una búsqueda nueva desde el encabezado. */}
      <MarketplaceCatalog
        key={q}
        products={products}
        initialQuery={q}
        title={q ? `Resultados para “${q}”` : "Buscar productos"}
      />
    </div>
  );
}
