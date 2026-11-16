import { Truck } from "lucide-react";
import { getShippingMethod, type CartTotals, type ShippingMethodId } from "@/lib/cart/pricing";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Desglose de totales. `shippingKnown = false` muestra el envío como "se
 * calcula en el checkout" (en el carro aún no se eligió el método).
 */
export function OrderSummary({
  totals,
  shippingMethod,
  shippingKnown = true,
  className,
  children,
}: {
  totals: CartTotals;
  shippingMethod: ShippingMethodId;
  shippingKnown?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const method = getShippingMethod(shippingMethod);
  const missingForFree =
    method.freeFrom !== null && totals.subtotal < method.freeFrom ? method.freeFrom - totals.subtotal : 0;

  return (
    <div className={cn("space-y-3 text-sm", className)}>
      <dl className="space-y-2">
        <Row label={`Productos (${totals.itemCount})`} value={formatPrice(totals.subtotal + totals.savings)} />
        {totals.savings > 0 && (
          <Row label="Descuentos" value={`−${formatPrice(totals.savings)}`} valueClassName="text-success" />
        )}
        <Row
          label="Envío"
          value={
            !shippingKnown ? (
              <span className="text-muted-foreground">Se calcula al pagar</span>
            ) : totals.shipping === 0 ? (
              <span className="text-success">Gratis</span>
            ) : (
              formatPrice(totals.shipping)
            )
          }
        />
        <div className="flex items-baseline justify-between gap-4 border-t pt-3">
          <dt className="text-base font-semibold">Total</dt>
          <dd className="text-xl font-semibold tabular-nums">
            {formatPrice(shippingKnown ? totals.total : totals.subtotal)}
          </dd>
        </div>
      </dl>

      {missingForFree > 0 && (
        <p className="flex items-start gap-2 rounded-[var(--radius)] bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Truck className="mt-px size-3.5 shrink-0" />
          <span>
            Te faltan <span className="font-medium text-foreground">{formatPrice(missingForFree)}</span> para el
            despacho gratis.
          </span>
        </p>
      )}

      {children}
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("tabular-nums", valueClassName)}>{value}</dd>
    </div>
  );
}
