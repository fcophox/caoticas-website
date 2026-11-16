"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openCartDrawer, useCart } from "@/lib/cart/store";

/** Botón del encabezado: abre el panel del carrito y muestra cuántas unidades hay. */
export function CartButton() {
  const items = useCart();
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const label = count > 0 ? `Abrir carro, ${count} ${count === 1 ? "producto" : "productos"}` : "Abrir carro";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative"
      onClick={openCartDrawer}
      aria-label={label}
    >
      <ShoppingBag className="size-5" aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold leading-none text-primary-foreground tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}
