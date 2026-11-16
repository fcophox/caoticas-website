"use client";

import { useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  PublicProductCard,
  effectivePrice,
  hasOffer,
} from "@/components/marketplace/product-card";
import type { MarketplaceProduct } from "@/lib/marketplace/data";

type Sort = "recent" | "price-asc" | "price-desc" | "discount";

const SORTS: { value: Sort; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
  { value: "discount", label: "Mayor descuento" },
];

/**
 * Buscador, filtros y grilla. El catálogo llega entero desde el servidor y se
 * filtra aquí: con cientos de productos es instantáneo y no hace falta API.
 * Cuando crezca, mover búsqueda y paginación a searchParams + servidor.
 */
type Props = {
  products: MarketplaceProduct[];
  title?: string;
  /** Texto del estado vacío (p. ej. una categoría todavía sin productos). */
  emptyMessage?: string;
};

export function MarketplaceCatalog({
  products,
  title = "Catálogo",
  emptyMessage = "Estamos preparando el catálogo. Vuelve en unos días.",
}: Props) {
  const [query, setQuery] = useState("");
  const [store, setStore] = useState<string>("all");
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [sort, setSort] = useState<Sort>("recent");

  const stores = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) map.set(p.store.slug, p.store.name);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (store === "all" || p.store.slug === store) &&
        (!onlyOffers || hasOffer(p)) &&
        (!q ||
          [p.name, p.detail, p.description, p.store.name].some((f) =>
            f?.toLowerCase().includes(q),
          )),
    );

    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => effectivePrice(a) - effectivePrice(b));
      case "price-desc":
        return [...list].sort((a, b) => effectivePrice(b) - effectivePrice(a));
      case "discount":
        return [...list].sort(
          (a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0),
        );
      default:
        return list;
    }
  }, [products, query, store, onlyOffers, sort]);

  if (products.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-dashed bg-card p-12 text-center">
        <ShoppingBag className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-3 font-medium">Pronto habrá productos aquí</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const selectClass =
    "h-9 rounded-[var(--radius)] border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <>
      <section id="catalogo" className="scroll-mt-20 border-t py-10">
        <h2 className="mb-5 text-xl font-semibold tracking-tight">{title}</h2>
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1 md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos o tiendas"
                className="pl-9"
                aria-label="Buscar productos"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 md:ml-auto">
              {stores.length > 1 && (
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className={selectClass}
                  aria-label="Filtrar por tienda"
                >
                  <option value="all">Todas las tiendas</option>
                  {stores.map(([slug, name]) => (
                    <option key={slug} value={slug}>
                      {name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className={selectClass}
                aria-label="Ordenar"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                aria-pressed={onlyOffers}
                onClick={() => setOnlyOffers((v) => !v)}
                className={`h-9 rounded-[var(--radius)] border px-3 text-sm transition-colors ${
                  onlyOffers
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sólo ofertas
              </button>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
            aria-live="polite"
          >
            <span>
              {visible.length} {visible.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Ningún producto coincide con tu búsqueda.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
              {visible.map((p) => (
                <PublicProductCard key={p.id} product={p} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
