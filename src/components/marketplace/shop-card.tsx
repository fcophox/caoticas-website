"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { DiscountTag, ProductImage, PublicPrice } from "@/components/marketplace/product-card";
import type { MarketplaceProduct } from "@/lib/marketplace/data";
import { cart, openCartDrawer, toCartItem } from "@/lib/cart/store";

/**
 * Tarjeta de vitrina con botón "Agregar" (Nuestros recomendados, campaña del
 * home). El ancho lo decide el `<li>` que la contiene.
 */
export function ShopCard({ product: p, sizes }: { product: MarketplaceProduct; sizes: string }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius)] border bg-card">
      <Link href={`/producto/${p.id}`} className="group flex flex-1 flex-col focus-visible:outline-none">
        <div className="relative">
          <ProductImage product={p} className="aspect-[4/3]" sizes={sizes} />
        </div>
        <div className="flex flex-1 flex-col p-4">
          {p.category && (
            <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
              {p.category.name}
            </p>
          )}
          <h3 className="mt-1 line-clamp-2 font-medium leading-snug group-hover:underline">{p.name}</h3>
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
  );
}
