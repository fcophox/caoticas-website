"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readLastOrder } from "@/lib/cart/last-order";
import { PAYMENT_METHODS, getShippingMethod } from "@/lib/cart/pricing";
import type { PlacedOrder } from "@/lib/marketplace/orders";
import { formatPrice } from "@/lib/products";

const noopSubscribe = () => () => {};

export function OrderConfirmation() {
  const order = useSyncExternalStore<PlacedOrder | null | undefined>(noopSubscribe, readLastOrder, () => undefined);

  if (order === undefined) {
    return <div aria-busy className="mt-8 h-96 animate-pulse rounded-[calc(var(--radius)+4px)] bg-muted/60" />;
  }

  if (!order) {
    return (
      <div className="mt-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">No encontramos un pedido reciente</h1>
        <p className="mt-2 text-muted-foreground">Si acabas de comprar, revisa tu correo: ahí está el detalle.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  const shipping = getShippingMethod(order.shippingMethod);
  const payment = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod);
  const firstName = order.contact.name.split(" ")[0];
  const address = [order.address.street, order.address.apartment, order.address.commune, order.address.region]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mt-6">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-full bg-success-surface">
          <CheckCircle2 className="size-8 text-success" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">¡Gracias, {firstName}!</h1>
        <p className="mt-2 text-muted-foreground">
          Recibimos tu pedido <span className="font-mono font-medium text-foreground">{order.number}</span>.
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="size-4" />
          Te enviamos el detalle a {order.contact.email}
        </p>
      </div>

      <div className="mt-8 rounded-[calc(var(--radius)+4px)] border bg-card">
        <ul className="divide-y px-5">
          {order.lines.map((l) => (
            <li key={l.productId} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{l.name}</p>
                <p className="text-xs text-muted-foreground">
                  {l.storeName} · {l.quantity} × {formatPrice(l.unitPrice)}
                </p>
              </div>
              <p className="tabular-nums">{formatPrice(l.unitPrice * l.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t px-5 py-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{shipping.label}</dt>
            <dd className="tabular-nums">{order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <dl className="grid gap-4 border-t px-5 py-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Despacho a</dt>
            <dd className="mt-1">{address}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Pago</dt>
            <dd className="mt-1">{payment?.label}</dd>
            <dd className="mt-0.5 text-xs text-muted-foreground">{payment?.description}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex justify-center">
        <Button asChild size="lg" className="rounded-full">
          <Link href="/#catalogo">Seguir comprando</Link>
        </Button>
      </div>
    </div>
  );
}
