"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PublicProductCard, effectivePrice, hasOffer } from "@/components/marketplace/product-card";
import type { MarketplaceCategory, MarketplaceProduct } from "@/lib/marketplace/data";
import { matchesQuery } from "@/lib/marketplace/search";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";

type Sort = "recent" | "price-asc" | "price-desc" | "discount";

const SORTS: { value: Sort; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
  { value: "discount", label: "Mayor descuento" },
];

/** Rangos de precio del filtro. `min` incluido, `max` excluido. */
const PRICE_RANGES = [
  { id: "hasta-1000", min: 0, max: 1000 },
  { id: "1000-2500", min: 1000, max: 2500 },
  { id: "2500-5000", min: 2500, max: 5000 },
  { id: "desde-5000", min: 5000, max: Infinity },
] as const;

type PriceRangeId = (typeof PRICE_RANGES)[number]["id"];

function priceLabel({ min, max }: (typeof PRICE_RANGES)[number]): string {
  if (min === 0) return `Hasta ${formatPrice(max)}`;
  if (max === Infinity) return `Más de ${formatPrice(min)}`;
  return `${formatPrice(min)} a ${formatPrice(max)}`;
}

function inRange(p: MarketplaceProduct, rangeId: PriceRangeId | null): boolean {
  if (!rangeId) return true;
  const range = PRICE_RANGES.find((r) => r.id === rangeId);
  if (!range) return true;
  const price = effectivePrice(p);
  return price >= range.min && price < range.max;
}

function isPriceRangeId(value: string | null): value is PriceRangeId {
  return PRICE_RANGES.some((r) => r.id === value);
}

/** Filtros tal como llegan en la URL; los valores desconocidos se ignoran. */
export type CatalogFilters = {
  query: string;
  categories: string[];
  price: string | null;
  onlyOffers: boolean;
};

type Props = {
  products: MarketplaceProduct[];
  categories: MarketplaceCategory[];
  /** Filtros con los que arranca, leídos de la URL. */
  initialFilters: CatalogFilters;
};

/**
 * Catálogo con filtros a la izquierda y grilla a la derecha. Todo se filtra en
 * el navegador y la URL se mantiene al día (`?q=…&categoria=…`) para poder
 * compartir o recargar una búsqueda sin perderla.
 */
export function CatalogBrowser({ products, categories, initialFilters }: Props) {
  const [query, setQuery] = useState(initialFilters.query);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    initialFilters.categories.filter((slug) => categories.some((c) => c.slug === slug)),
  );
  const [price, setPrice] = useState<PriceRangeId | null>(() =>
    isPriceRangeId(initialFilters.price) ? initialFilters.price : null,
  );
  const [onlyOffers, setOnlyOffers] = useState(initialFilters.onlyOffers);
  const [sort, setSort] = useState<Sort>("recent");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const panelId = useId();

  // Refleja los filtros en la URL sin volver a pedir la página al servidor.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    for (const slug of selectedCategories) params.append("categoria", slug);
    if (price) params.set("precio", price);
    if (onlyOffers) params.set("ofertas", "1");
    const search = params.toString();
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  }, [query, selectedCategories, price, onlyOffers]);

  const offerCount = useMemo(() => products.filter(hasOffer).length, [products]);

  // Cada filtro cuenta con los demás aplicados, así los números dicen cuántos
  // productos quedarían al marcarlo.
  const matches = useMemo(() => {
    const byQuery = (p: MarketplaceProduct) => matchesQuery(p, query);
    const byCategory = (p: MarketplaceProduct) =>
      selectedCategories.length === 0 || selectedCategories.includes(p.category?.slug ?? "");
    const byPrice = (p: MarketplaceProduct) => inRange(p, price);
    const byOffer = (p: MarketplaceProduct) => !onlyOffers || hasOffer(p);

    const categoryCounts = new Map<string, number>();
    for (const p of products) {
      if (p.category && byQuery(p) && byPrice(p) && byOffer(p)) {
        categoryCounts.set(p.category.slug, (categoryCounts.get(p.category.slug) ?? 0) + 1);
      }
    }
    const priceCounts = new Map<PriceRangeId, number>();
    for (const range of PRICE_RANGES) {
      priceCounts.set(
        range.id,
        products.filter((p) => byQuery(p) && byCategory(p) && byOffer(p) && inRange(p, range.id)).length,
      );
    }
    const list = products.filter((p) => byQuery(p) && byCategory(p) && byPrice(p) && byOffer(p));
    return { list, categoryCounts, priceCounts };
  }, [products, query, selectedCategories, price, onlyOffers]);

  const visible = useMemo(() => {
    const list = matches.list;
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => effectivePrice(a) - effectivePrice(b));
      case "price-desc":
        return [...list].sort((a, b) => effectivePrice(b) - effectivePrice(a));
      case "discount":
        return [...list].sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
      default:
        return list;
    }
  }, [matches.list, sort]);

  const activeCount =
    (query.trim() ? 1 : 0) + selectedCategories.length + (price ? 1 : 0) + (onlyOffers ? 1 : 0);

  function toggleCategory(slug: string) {
    setSelectedCategories((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug],
    );
  }

  function clearFilters() {
    setQuery("");
    setSelectedCategories([]);
    setPrice(null);
    setOnlyOffers(false);
  }

  if (products.length === 0) {
    return (
      <div className="my-10 rounded-[var(--radius)] border border-dashed bg-card p-12 text-center">
        <ShoppingBag className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-3 font-medium">Pronto habrá productos aquí</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Estamos preparando el catálogo. Vuelve en unos días.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 lg:py-10">
      {/* Columna de filtros. En celular se abre con el botón "Filtros". */}
      <aside aria-label="Filtros" className="lg:sticky lg:top-24 lg:self-start">
        <button
          type="button"
          aria-expanded={isFiltersOpen}
          aria-controls={panelId}
          onClick={() => setIsFiltersOpen((v) => !v)}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius)] border bg-background text-sm font-medium lg:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Filtros
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">
              {activeCount}
            </span>
          )}
        </button>

        <div
          id={panelId}
          className={cn(
            "mt-4 space-y-7 rounded-[var(--radius)] border bg-card p-4 lg:mt-0 lg:block lg:border-0 lg:bg-transparent lg:p-0",
            isFiltersOpen ? "block" : "hidden",
          )}
        >
          <FilterGroup title="Buscar">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, aroma, tipo…"
                className="pl-9"
                aria-label="Buscar en el catálogo"
              />
            </div>
          </FilterGroup>

          <FilterGroup title="Categorías">
            <ul className="space-y-1">
              {categories.map((c) => {
                const count = matches.categoryCounts.get(c.slug) ?? 0;
                const isChecked = selectedCategories.includes(c.slug);
                return (
                  <li key={c.slug}>
                    <FilterOption
                      type="checkbox"
                      label={c.name}
                      count={count}
                      checked={isChecked}
                      disabled={count === 0 && !isChecked}
                      onChange={() => toggleCategory(c.slug)}
                    />
                  </li>
                );
              })}
            </ul>
          </FilterGroup>

          <FilterGroup title="Precio">
            <ul className="space-y-1">
              <li>
                <FilterOption
                  type="radio"
                  name="precio"
                  label="Todos los precios"
                  checked={price === null}
                  onChange={() => setPrice(null)}
                />
              </li>
              {PRICE_RANGES.map((range) => {
                const count = matches.priceCounts.get(range.id) ?? 0;
                return (
                  <li key={range.id}>
                    <FilterOption
                      type="radio"
                      name="precio"
                      label={priceLabel(range)}
                      count={count}
                      checked={price === range.id}
                      disabled={count === 0 && price !== range.id}
                      onChange={() => setPrice(range.id)}
                    />
                  </li>
                );
              })}
            </ul>
          </FilterGroup>

          {offerCount > 0 && (
            <FilterGroup title="Ofertas">
              <FilterOption
                type="checkbox"
                label="Sólo productos en oferta"
                count={offerCount}
                checked={onlyOffers}
                onChange={() => setOnlyOffers((v) => !v)}
              />
            </FilterGroup>
          )}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <X className="size-4" />
              Limpiar filtros
            </button>
          )}
        </div>
      </aside>

      {/* Columna de productos: cuatro por fila en escritorio, el resto se apila abajo. */}
      <section aria-label="Productos" className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {visible.length} {visible.length === 1 ? "producto" : "productos"}
          </p>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Ordenar por
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-9 rounded-[var(--radius)] border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-dashed bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Ningún producto coincide con los filtros.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {visible.map((p) => (
              <PublicProductCard key={p.id} product={p} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

type FilterOptionProps = {
  type: "checkbox" | "radio";
  name?: string;
  label: string;
  count?: number;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
};

function FilterOption({ type, name, label, count, checked, disabled, onChange }: FilterOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="size-4 shrink-0 accent-primary"
      />
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      )}
    </label>
  );
}
