"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Megaphone,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscountTag, ProductImage, PublicPrice } from "@/components/marketplace/product-card";
import type { MarketplaceCollection, MarketplaceProduct } from "@/lib/marketplace/data";
import { cart, openCartDrawer, toCartItem } from "@/lib/cart/store";

/** Ícono de cada pestaña. Una colección nueva sin entrada aquí usa la etiqueta. */
const ICONS: Record<string, LucideIcon> = {
  "nuevos-lanzamientos": Sparkles,
  virales: Megaphone,
  "marcas-exclusivas": Star,
  "lo-mas-vendido": Flame,
};

/**
 * "Nuestros recomendados": pestañas por colección especial y, debajo, un
 * carrusel horizontal con los productos de la pestaña activa.
 */
export function RecommendedProducts({ collections }: { collections: MarketplaceCollection[] }) {
  const [active, setActive] = useState(collections[0]?.slug ?? "");
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScroll, setCanScroll] = useState({ prev: false, next: false });

  const current = collections.find((c) => c.slug === active) ?? collections[0];

  // Las flechas se desactivan en los extremos. Se recalcula al desplazar,
  // al cambiar de pestaña y al redimensionar.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () =>
      setCanScroll({
        prev: track.scrollLeft > 4,
        next: track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
      });
    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [current?.slug]);

  if (!current) return null;

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="recomendados" className="border-t py-12 md:py-16">
      <h2 id="recomendados" className="text-center text-2xl font-bold tracking-tight md:text-3xl">
        Nuestros recomendados
      </h2>

      <div
        role="tablist"
        aria-label="Colecciones"
        className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:justify-center md:px-0"
      >
        {collections.map((c) => {
          const Icon = ICONS[c.slug] ?? Tag;
          const isActive = c.slug === current.slug;
          return (
            <button
              key={c.slug}
              type="button"
              role="tab"
              id={`tab-${c.slug}`}
              aria-selected={isActive}
              aria-controls="recomendados-panel"
              onClick={() => setActive(c.slug)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-[var(--radius)] border px-4 py-2 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {c.name}
            </button>
          );
        })}
      </div>

      <div
        id="recomendados-panel"
        role="tabpanel"
        aria-labelledby={`tab-${current.slug}`}
        className="relative mt-8"
      >
        {/* `key` por pestaña: la lista se monta de nuevo y arranca desde el inicio. */}
        <ul
          key={current.slug}
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {current.products.map((p) => (
            <RecommendedCard key={p.id} product={p} />
          ))}
        </ul>

        <CarouselArrow side="left" disabled={!canScroll.prev} onClick={() => scrollByPage(-1)} />
        <CarouselArrow side="right" disabled={!canScroll.next} onClick={() => scrollByPage(1)} />
      </div>
    </section>
  );
}

function RecommendedCard({ product: p }: { product: MarketplaceProduct }) {
  return (
    <li className="w-[70%] shrink-0 snap-start sm:w-[45%] md:w-[31%] lg:w-[calc(25%-12px)]">
      <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius)] border bg-card">
        <Link href={`/producto/${p.id}`} className="group flex flex-1 flex-col focus-visible:outline-none">
          <div className="relative">
            <ProductImage
              product={p}
              className="aspect-[4/3]"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 70vw"
            />
          </div>
          <div className="flex flex-1 flex-col p-4">
            {p.category && (
              <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
                {p.category.name}
              </p>
            )}
            <h3 className="mt-1 line-clamp-2 font-medium leading-snug group-hover:underline">
              {p.name}
            </h3>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
              <PublicPrice product={p} />
              <DiscountTag product={p} />
            </div>
          </div>
        </Link>

        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => {
              cart.add(toCartItem(p));
              openCartDrawer();
            }}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ShoppingBag className="size-4" />
            Agregar
          </button>
        </div>
      </article>
    </li>
  );
}

function CarouselArrow({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Ver anteriores" : "Ver siguientes"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "absolute top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border bg-background shadow-sm transition-opacity hover:bg-accent disabled:pointer-events-none disabled:opacity-0 md:grid",
        side === "left" ? "-left-5 xl:-left-14" : "-right-5 xl:-right-14",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
