"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_SHIPPING, cartTotals } from "@/lib/cart/pricing";
import { closeCartDrawer, useCart, useCartDrawer } from "@/lib/cart/store";
import { CartLine } from "./cart-line";
import { OrderSummary } from "./order-summary";

/**
 * Panel lateral del carrito. Usa <dialog> nativo con `showModal()`: el
 * navegador se encarga del foco atrapado, de Esc y del fondo inerte.
 */
export function CartDrawer() {
  const items = useCart();
  const isOpen = useCartDrawer();
  const pathname = usePathname();
  const ref = useRef<HTMLDialogElement>(null);
  const totals = cartTotals(items, DEFAULT_SHIPPING);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Cualquier navegación cierra el panel.
  useEffect(() => {
    closeCartDrawer();
  }, [pathname]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) closeCartDrawer();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="cart-drawer-title"
      onClose={closeCartDrawer}
      onClick={handleBackdropClick}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md bg-background p-0 text-foreground shadow-xl transition-transform duration-300 ease-out backdrop:bg-overlay/60 starting:open:translate-x-full"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 id="cart-drawer-title" className="text-lg font-semibold tracking-tight">
            Tu carro
            {totals.itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {totals.itemCount} {totals.itemCount === 1 ? "producto" : "productos"}
              </span>
            )}
          </h2>
          <Button type="button" variant="ghost" size="icon" onClick={closeCartDrawer} aria-label="Cerrar carro">
            <X />
          </Button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-muted">
              <ShoppingBag className="size-6 text-muted-foreground" />
            </span>
            <p className="font-medium">Tu carro está vacío</p>
            <p className="text-sm text-muted-foreground">Explora el catálogo y agrega lo que te guste.</p>
            <Button asChild variant="outline" className="mt-2 rounded-full">
              <Link href="/catalogo" onClick={closeCartDrawer}>
                Ver catálogo
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {items.map((item) => (
                <CartLine key={item.productId} item={item} compact onNavigate={closeCartDrawer} />
              ))}
            </ul>

            <footer className="border-t px-5 py-4">
              <OrderSummary totals={totals} shippingMethod={DEFAULT_SHIPPING} shippingKnown={false}>
                <div className="grid gap-2 pt-1">
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="/checkout" onClick={closeCartDrawer}>
                      Ir a pagar
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full">
                    <Link href="/carrito" onClick={closeCartDrawer}>
                      Ver carro completo
                    </Link>
                  </Button>
                </div>
              </OrderSummary>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}
