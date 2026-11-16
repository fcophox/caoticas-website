"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Share2, ShieldCheck, Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { DiscountTag, PublicPrice, hasOffer } from "@/components/marketplace/product-card";
import { cart, openCartDrawer, toCartItem, useCart } from "@/lib/cart/store";
import { MAX_QUANTITY } from "@/lib/cart/pricing";
import { formatPrice } from "@/lib/products";
import type { MarketplaceProduct } from "@/lib/marketplace/data";

/**
 * Cuadro resumen de la ficha (columna derecha): identidad del producto,
 * precio, acciones de compra, opciones de entrega y características.
 *
 * "Agregar al carro" suma la cantidad elegida y abre el panel del carrito;
 * "Comprar ahora" la suma y lleva directo al checkout.
 */
export function PurchasePanel({ product: p }: { product: MarketplaceProduct }) {
  const router = useRouter();
  const inCart = useCart().find((i) => i.productId === p.id)?.quantity ?? 0;
  const [quantity, setQuantity] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const available = MAX_QUANTITY - inCart;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: p.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // El usuario canceló el diálogo de compartir: no es un error.
    }
  };

  const addToCart = () => {
    cart.add(toCartItem(p, Math.min(quantity, Math.max(available, 0))));
    setQuantity(1);
  };

  const handleAdd = () => {
    if (available > 0) addToCart();
    openCartDrawer();
  };

  const handleBuyNow = () => {
    if (available > 0) addToCart();
    router.push("/checkout");
  };

  const features: [string, string][] = [
    ["Tienda", p.store.name],
    ...(p.detail ? ([["Detalle", p.detail]] as [string, string][]) : []),
    ["Precio normal", formatPrice(p.price)],
    ...(hasOffer(p)
      ? ([
          ["Precio oferta", formatPrice(p.salePrice)],
          ["Descuento", `${Math.round(p.discountPercent ?? 0)}%`],
        ] as [string, string][])
      : []),
  ];

  return (
    <div className="rounded-[calc(var(--radius)+4px)] border bg-card p-5 lg:sticky lg:top-20">
      {/* Identidad */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{p.store.name}</p>
          <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight">{p.name}</h1>
        </div>
        <button
          type="button"
          onClick={handleShare}
          aria-label={isCopied ? "Enlace copiado" : "Compartir producto"}
          title={isCopied ? "Enlace copiado" : "Compartir"}
          className="grid size-10 shrink-0 place-items-center rounded-full border bg-muted/50 transition-colors hover:bg-muted"
        >
          {isCopied ? <Check className="size-4" /> : <Share2 className="size-4" />}
        </button>
      </div>

      <p className="mt-2 inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-sm">
        Vendido por <span className="font-medium underline underline-offset-2">{p.store.name}</span>
      </p>
      {p.detail && <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>}

      {/* Precio */}
      <div className="mt-4 border-t pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <PublicPrice product={p} size="lg" />
          <DiscountTag product={p} />
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium">Cantidad</span>
        <QuantityStepper
          label={p.name}
          value={quantity}
          onChange={(q) => setQuantity(Math.min(q, Math.max(available, 1)))}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button type="button" size="lg" className="rounded-full" onClick={handleBuyNow}>
          Comprar ahora
        </Button>
        <Button type="button" size="lg" variant="outline" className="rounded-full" onClick={handleAdd}>
          Agregar al carro
        </Button>
      </div>
      {inCart > 0 && (
        <p role="status" className="mt-2 text-center text-sm text-muted-foreground">
          {available > 0
            ? `Ya tienes ${inCart} en tu carro.`
            : `Llegaste al máximo de ${MAX_QUANTITY} unidades para este producto.`}
        </p>
      )}

      {/* Entrega */}
      <h2 className="mt-6 text-sm font-medium">Entrega</h2>
      <ul className="mt-2 divide-y rounded-[var(--radius)] border">
        <DeliveryOption
          icon={Truck}
          title="Despacho a domicilio"
          text="Recíbelo en tu casa en 2 a 5 días hábiles."
        />
        <DeliveryOption icon={Zap} title="Envío express" text="Disponible en algunas comunas." />
      </ul>

      {/* Información */}
      <div className="mt-4 space-y-2">
        {p.description && (
          <Accordion title="Descripción" defaultOpen>
            <p className="whitespace-pre-line text-pretty">{p.description}</p>
          </Accordion>
        )}
        <Accordion title="Características principales">
          <dl className="divide-y">
            {features.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2">
                <dt>{label}</dt>
                <dd className="text-right font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </Accordion>
        <Accordion title="Cambios y devoluciones">
          <p className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            Tienes 30 días desde que recibes tu pedido para solicitar un cambio o devolución,
            siempre que el producto esté sin uso y con su empaque original.
          </p>
        </Accordion>
      </div>
    </div>
  );
}

function DeliveryOption({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3 p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{text}</p>
      </div>
    </li>
  );
}

function Accordion({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-[var(--radius)] border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 text-sm text-muted-foreground">{children}</div>
    </details>
  );
}
