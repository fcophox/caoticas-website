"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ImageOff, Search, X } from "lucide-react";
import { PublicPrice } from "@/components/marketplace/product-card";
import { searchProducts } from "@/lib/marketplace/search";
import type { MarketplaceProduct } from "@/lib/marketplace/data";
import { cn } from "@/lib/utils";

const MAX_SUGGESTIONS = 6;

type Props = {
  products: MarketplaceProduct[];
  className?: string;
};

/**
 * Buscador del encabezado (patrón combobox): sugiere productos mientras se
 * escribe; Enter abre el producto marcado o, si no hay ninguno, la página
 * /buscar con todos los resultados. Flechas para moverse, Esc para cerrar.
 */
export function HeaderSearch({ products, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const urlQuery = pathname === "/buscar" ? (searchParams.get("q") ?? "") : "";
  const [query, setQuery] = useState(urlQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // Al navegar, el campo refleja la búsqueda de /buscar o se limpia.
  useEffect(() => {
    setQuery(urlQuery);
    setIsOpen(false);
  }, [urlQuery, pathname]);

  // Clic fuera cierra las sugerencias.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  const trimmed = query.trim();
  const suggestions = searchProducts(products, trimmed, MAX_SUGGESTIONS);
  const total = trimmed ? searchProducts(products, trimmed).length : 0;
  const showPanel = isOpen && trimmed.length > 0;

  const goToResults = () => {
    if (!trimmed) return;
    setIsOpen(false);
    inputRef.current?.blur();
    router.push(`/buscar?q=${encodeURIComponent(trimmed)}`);
  };

  const goToProduct = (id: string) => {
    setIsOpen(false);
    inputRef.current?.blur();
    router.push(`/producto/${id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = suggestions[active];
    if (showPanel && selected) goToProduct(selected.id);
    else goToResults();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActive((i) => (suggestions.length ? (i + 1) % suggestions.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (suggestions.length ? (i <= 0 ? suggestions.length - 1 : i - 1) : -1));
    } else if (e.key === "Escape") {
      if (showPanel) {
        e.preventDefault();
        setIsOpen(false);
      }
    }
  };

  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    <form
      ref={rootRef}
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative", className)}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        name="q"
        role="combobox"
        aria-label="Buscar productos"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Buscar productos o categorías"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(-1);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="h-10 w-full rounded-full border bg-background/80 pl-9 pr-9 text-sm outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setActive(-1);
            inputRef.current?.focus();
          }}
          aria-label="Borrar búsqueda"
          className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-[calc(var(--radius)+4px)] border bg-popover text-popover-foreground shadow-lg">
          {suggestions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No encontramos productos para “{trimmed}”.
            </p>
          ) : (
            <>
              <ul id={listId} role="listbox" aria-label="Sugerencias" className="max-h-[60vh] overflow-y-auto py-1">
                {suggestions.map((p, i) => (
                  <li
                    key={p.id}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === active}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => goToProduct(p.id)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2",
                      i === active && "bg-muted",
                    )}
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-[var(--radius)] bg-muted">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt="" fill unoptimized sizes="44px" className="object-cover" />
                      ) : (
                        <ImageOff className="m-auto size-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      {p.category && (
                        <span className="block truncate text-xs text-muted-foreground">{p.category.name}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-right [&_span]:text-sm">
                      <PublicPrice product={p} />
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="submit"
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  goToResults();
                }}
                className="flex w-full items-center justify-between gap-2 border-t px-4 py-3 text-sm font-medium hover:bg-muted"
              >
                Ver {total === 1 ? "el resultado" : `los ${total} resultados`}
                <ArrowRight className="size-4" />
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}
