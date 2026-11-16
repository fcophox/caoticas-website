import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { MarketplaceProduct } from "@/lib/marketplace/data";

/** Tipos y piezas visuales del escaparate público. Sin estado: sirven en servidor y cliente. */

export function hasOffer(p: Pick<MarketplaceProduct, "price" | "salePrice">) {
  return p.salePrice !== null && p.salePrice < p.price;
}

export function effectivePrice(p: Pick<MarketplaceProduct, "price" | "salePrice">) {
  return hasOffer(p) ? p.salePrice! : p.price;
}

export function PublicPrice({
  product: p,
  size = "md",
}: {
  product: MarketplaceProduct;
  size?: "md" | "lg";
}) {
  const main = size === "lg" ? "text-3xl" : "text-lg";
  if (!hasOffer(p)) {
    return <span className={cn(main, "font-semibold tabular-nums")}>{formatPrice(p.price)}</span>;
  }
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={cn(main, "font-semibold tabular-nums")}>{formatPrice(p.salePrice)}</span>
      <span className="text-sm text-muted-foreground line-through tabular-nums">
        {formatPrice(p.price)}
      </span>
    </span>
  );
}

export function DiscountTag({ product: p, className }: { product: MarketplaceProduct; className?: string }) {
  if (!hasOffer(p) || !p.discountPercent) return null;
  return (
    <span
      className={cn(
        "rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums",
        className,
      )}
    >
      −{Math.round(p.discountPercent)}%
    </span>
  );
}

export function ProductImage({
  product: p,
  sizes,
  className,
  priority,
}: {
  product: MarketplaceProduct;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {p.imageUrl ? (
        <Image
          src={p.imageUrl}
          alt={p.name}
          fill
          unoptimized
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="grid size-full place-items-center text-muted-foreground">
          <ImageOff className="size-6" />
        </div>
      )}
    </div>
  );
}

export function PublicProductCard({ product: p }: { product: MarketplaceProduct }) {
  return (
    <li>
      <Link
        href={`/producto/${p.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-[var(--radius)] border bg-card transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative">
          <ProductImage
            product={p}
            className="aspect-square"
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
          <DiscountTag product={p} className="absolute left-2 top-2" />
        </div>

        <div className="flex flex-1 flex-col p-3">
          <h3 className="line-clamp-2 font-medium leading-snug" title={p.name}>
            {p.name}
          </h3>
          {p.detail && <p className="mt-1 truncate text-xs text-muted-foreground">{p.detail}</p>}
          <div className="mt-auto pt-3">
            <PublicPrice product={p} />
          </div>
        </div>
      </Link>
    </li>
  );
}
