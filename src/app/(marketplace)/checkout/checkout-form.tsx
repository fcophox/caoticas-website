"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, Lock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderSummary } from "@/components/cart/order-summary";
import {
  DEFAULT_SHIPPING,
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  cartTotals,
  shippingCost,
  type PaymentMethodId,
  type ShippingMethodId,
} from "@/lib/cart/pricing";
import { REGIONS } from "@/lib/cart/regions";
import { saveLastOrder } from "@/lib/cart/last-order";
import { cart, useCart, useCartReady } from "@/lib/cart/store";
import {
  placeOrder,
  type CheckoutAddress,
  type CheckoutContact,
  type FieldErrors,
} from "@/lib/marketplace/orders";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";

type FormValues = CheckoutContact & CheckoutAddress;

const INITIAL: FormValues = {
  email: "",
  name: "",
  phone: "",
  street: "",
  apartment: "",
  commune: "",
  region: "",
  notes: "",
};

/** Paso 2: datos de contacto, despacho, envío y pago, con el resumen al lado. */
export function CheckoutForm() {
  const router = useRouter();
  const items = useCart();
  const isReady = useCartReady();
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>(DEFAULT_SHIPPING);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>(PAYMENT_METHODS[0].id);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isPlaced, setIsPlaced] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totals = cartTotals(items, shippingMethod);

  if (!isReady || isPlaced) {
    return <div aria-busy className="mt-8 h-96 animate-pulse rounded-[calc(var(--radius)+4px)] bg-muted/60" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-[calc(var(--radius)+4px)] border bg-card px-6 py-16 text-center">
        <ShoppingBag className="size-8 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">No hay nada que pagar</h2>
        <p className="mt-1 text-sm text-muted-foreground">Agrega productos a tu carro para finalizar la compra.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/#catalogo">Ir al catálogo</Link>
        </Button>
      </div>
    );
  }

  const field = (name: keyof FormValues) => ({
    id: `checkout-${name}`,
    name,
    value: values[name],
    "aria-invalid": fieldErrors[name] ? true : undefined,
    "aria-describedby": fieldErrors[name] ? `checkout-${name}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setValues((v) => ({ ...v, [name]: value }));
      if (fieldErrors[name]) {
        setFieldErrors((errors) => {
          const next = { ...errors };
          delete next[name];
          return next;
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { email, name, phone, ...address } = values;
      const result = await placeOrder({
        lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
        contact: { email, name, phone },
        address,
        shippingMethod,
        paymentMethod,
      });

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        if (result.updates) cart.applyUpdates(result.updates);
        const firstInvalid = Object.keys(result.fieldErrors ?? {})[0];
        if (firstInvalid) document.getElementById(`checkout-${firstInvalid}`)?.focus();
        return;
      }

      saveLastOrder(result.order);
      setIsPlaced(true);
      cart.clear();
      router.replace("/checkout/confirmacion");
    });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]"
    >
      <div className="space-y-6">
        <Section title="Contacto" step={1}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Correo electrónico" error={fieldErrors.email} htmlFor="checkout-email" className="sm:col-span-2">
              <Input type="email" autoComplete="email" inputMode="email" placeholder="tu@correo.cl" {...field("email")} />
            </Field>
            <Field label="Nombre y apellido" error={fieldErrors.name} htmlFor="checkout-name">
              <Input autoComplete="name" {...field("name")} />
            </Field>
            <Field label="Teléfono" error={fieldErrors.phone} htmlFor="checkout-phone">
              <Input type="tel" autoComplete="tel" placeholder="+56 9 1234 5678" {...field("phone")} />
            </Field>
          </div>
        </Section>

        <Section title="Dirección de despacho" step={2}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Calle y número" error={fieldErrors.street} htmlFor="checkout-street" className="sm:col-span-2">
              <Input autoComplete="address-line1" {...field("street")} />
            </Field>
            <Field label="Depto, casa u oficina (opcional)" htmlFor="checkout-apartment" className="sm:col-span-2">
              <Input autoComplete="address-line2" {...field("apartment")} />
            </Field>
            <Field label="Comuna" error={fieldErrors.commune} htmlFor="checkout-commune">
              <Input autoComplete="address-level2" {...field("commune")} />
            </Field>
            <Field label="Región" error={fieldErrors.region} htmlFor="checkout-region">
              <select
                autoComplete="address-level1"
                className="h-9 w-full rounded-[var(--radius)] border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                {...field("region")}
              >
                <option value="" disabled>
                  Elige una región
                </option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Indicaciones para la entrega (opcional)" htmlFor="checkout-notes" className="sm:col-span-2">
              <textarea
                rows={2}
                maxLength={300}
                placeholder="Ej.: dejar en conserjería"
                className="w-full rounded-[var(--radius)] border bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                {...field("notes")}
              />
            </Field>
          </div>
        </Section>

        <Section title="Método de envío" step={3}>
          <fieldset className="grid gap-2">
            <legend className="sr-only">Método de envío</legend>
            {SHIPPING_METHODS.map((m) => {
              const cost = shippingCost(m.id, totals.subtotal);
              return (
                <Choice
                  key={m.id}
                  name="shippingMethod"
                  value={m.id}
                  checked={shippingMethod === m.id}
                  onChange={() => setShippingMethod(m.id)}
                  title={m.label}
                  description={m.description}
                  aside={cost === 0 ? <span className="text-success">Gratis</span> : formatPrice(cost)}
                />
              );
            })}
          </fieldset>
        </Section>

        <Section title="Pago" step={4}>
          <fieldset className="grid gap-2">
            <legend className="sr-only">Método de pago</legend>
            {PAYMENT_METHODS.map((m) => (
              <Choice
                key={m.id}
                name="paymentMethod"
                value={m.id}
                checked={paymentMethod === m.id}
                onChange={() => setPaymentMethod(m.id)}
                title={m.label}
                description={m.description}
              />
            ))}
          </fieldset>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            Nunca te pediremos los datos de tu tarjeta en esta página.
          </p>
        </Section>
      </div>

      <aside className="rounded-[calc(var(--radius)+4px)] border bg-card p-5 lg:sticky lg:top-20">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Tu pedido</h2>
          <Link href="/carrito" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Editar
          </Link>
        </div>

        <ul className="mt-3 max-h-72 divide-y overflow-y-auto">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3 py-3">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-[var(--radius)] border bg-muted">
                {i.imageUrl && <Image src={i.imageUrl} alt="" fill unoptimized sizes="48px" className="object-cover" />}
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-foreground text-[0.65rem] font-semibold text-background tabular-nums">
                  {i.quantity}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{i.name}</p>
              </div>
              <p className="text-sm tabular-nums">{formatPrice(i.unitPrice * i.quantity)}</p>
            </li>
          ))}
        </ul>

        <OrderSummary totals={totals} shippingMethod={shippingMethod} className="mt-3 border-t pt-4">
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-[var(--radius)] bg-danger-surface px-3 py-2 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full rounded-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" /> Procesando…
              </>
            ) : (
              `Confirmar pedido · ${formatPrice(totals.total)}`
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Al confirmar aceptas los{" "}
            <Link href="/terminos" className="underline underline-offset-2 hover:text-foreground">
              términos y condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/cambios-y-devoluciones" className="underline underline-offset-2 hover:text-foreground">
              política de cambios y devoluciones
            </Link>
            .
          </p>
        </OrderSummary>

        <Link
          href="/carrito"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al carro
        </Link>
      </aside>
    </form>
  );
}

function Section({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <section className="rounded-[calc(var(--radius)+4px)] border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <span className="grid size-6 place-items-center rounded-full bg-muted text-xs tabular-nums">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Choice({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  aside,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
  aside?: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-[var(--radius)] border p-3 transition-colors hover:bg-muted/40",
        checked && "border-primary bg-muted/40",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 size-4 accent-[var(--primary)]"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      {aside && <span className="text-sm font-medium tabular-nums">{aside}</span>}
    </label>
  );
}
