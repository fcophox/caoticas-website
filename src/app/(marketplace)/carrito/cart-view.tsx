"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartLine } from "@/components/cart/cart-line";
import { OrderSummary } from "@/components/cart/order-summary";
import { DEFAULT_SHIPPING, cartTotals } from "@/lib/cart/pricing";
import { cart, useCart, useCartReady, type CartItem } from "@/lib/cart/store";

/** Agrupa por tienda: en un marketplace cada tienda prepara su parte del pedido. */
function groupByStore(items: CartItem[]) {
  const groups = new Map<string, { name: string; items: CartItem[] }>();
  for (const item of items) {
    const group = groups.get(item.store.slug) ?? { name: item.store.name, items: [] };
    group.items.push(item);
    groups.set(item.store.slug, group);
  }
  return [...groups.entries()];
}

export function CartView() {
  const items = useCart();
  const isReady = useCartReady();
  const totals = cartTotals(items, DEFAULT_SHIPPING);

  if (!isReady) {
    return <div aria-busy className="mt-8 h-64 animate-pulse rounded-[calc(var(--radius)+4px)] bg-muted/60" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-[calc(var(--radius)+4px)] border bg-card px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-muted">
          <ShoppingBag className="size-7 text-muted-foreground" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Tu carro está vacío</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Cuando agregues productos los verás aquí. Tu carro se guarda en este navegador.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/#catalogo">Explorar el catálogo</Link>
        </Button>
      </div>
    );
  }

  const groups = groupByStore(items);

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4">
        {groups.map(([slug, group]) => (
          <section key={slug} className="rounded-[calc(var(--radius)+4px)] border bg-card px-5">
            <h2 className="flex items-center gap-2 border-b py-3 text-sm font-medium">
              <Store className="size-4 text-muted-foreground" />
              {group.name}
            </h2>
            <ul className="divide-y">
              {group.items.map((item) => (
                <CartLine key={item.productId} item={item} />
              ))}
            </ul>
          </section>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/#catalogo"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Seguir comprando
          </Link>
          <button
            type="button"
            onClick={() => cart.clear()}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Vaciar carro
          </button>
        </div>
      </div>

      <aside className="rounded-[calc(var(--radius)+4px)] border bg-card p-5 lg:sticky lg:top-20">
        <h2 className="mb-4 font-semibold">Resumen</h2>
        <OrderSummary totals={totals} shippingMethod={DEFAULT_SHIPPING} shippingKnown={false}>
          <Button asChild size="lg" className="w-full rounded-full">
            <Link href="/checkout">Continuar con la compra</Link>
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Compra protegida · 30 días para cambios
          </p>
        </OrderSummary>
      </aside>
    </div>
  );
}
