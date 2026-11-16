"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { cart, type CartItem } from "@/lib/cart/store";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "./quantity-stepper";

/** Una línea del carrito: imagen, nombre, cantidad editable y total. */
export function CartLine({
  item,
  compact,
  onNavigate,
}: {
  item: CartItem;
  /** Versión del panel lateral: imagen más chica y sin detalle. */
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const href = `/producto/${item.productId}`;
  const lineTotal = item.unitPrice * item.quantity;
  const onSale = item.unitPrice < item.listPrice;

  return (
    <li className="flex gap-3 py-4">
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[var(--radius)] border bg-muted",
          compact ? "size-16" : "size-20 sm:size-24",
        )}
      >
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill unoptimized sizes="96px" className="object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-5" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={href}
              onClick={onNavigate}
              className="line-clamp-2 font-medium leading-snug hover:underline"
            >
              {item.name}
            </Link>
            {item.detail && !compact && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.detail}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-semibold tabular-nums">{formatPrice(lineTotal)}</p>
            {onSale && (
              <p className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(item.listPrice * item.quantity)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <QuantityStepper
            size="sm"
            label={item.name}
            value={item.quantity}
            onChange={(q) => cart.setQuantity(item.productId, q)}
            onRemove={() => cart.remove(item.productId)}
          />
          {item.quantity > 1 && (
            <p className="text-xs text-muted-foreground tabular-nums">{formatPrice(item.unitPrice)} c/u</p>
          )}
        </div>
      </div>
    </li>
  );
}
