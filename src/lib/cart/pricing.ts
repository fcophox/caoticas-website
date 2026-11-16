/**
 * Reglas de precio del carrito: envío, límites y totales.
 *
 * Sin "use client": lo usan tanto el carrito (navegador) como la acción del
 * checkout (servidor), así ambos calculan exactamente lo mismo.
 */

/** Tope de unidades por producto en un pedido. */
export const MAX_QUANTITY = 10;

export const SHIPPING_METHODS = [
  {
    id: "domicilio",
    label: "Despacho a domicilio",
    description: "Recíbelo en 2 a 5 días hábiles.",
    price: 3990,
    /** Subtotal desde el que el envío es gratis; `null` = nunca. */
    freeFrom: 49990 as number | null,
  },
  {
    id: "express",
    label: "Envío express",
    description: "En 24 a 48 horas. Disponible en algunas comunas.",
    price: 6990,
    freeFrom: null as number | null,
  },
] as const;

export type ShippingMethodId = (typeof SHIPPING_METHODS)[number]["id"];
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

export const DEFAULT_SHIPPING: ShippingMethodId = "domicilio";

export function isShippingMethodId(value: unknown): value is ShippingMethodId {
  return SHIPPING_METHODS.some((m) => m.id === value);
}

export function getShippingMethod(id: ShippingMethodId): ShippingMethod {
  return SHIPPING_METHODS.find((m) => m.id === id) ?? SHIPPING_METHODS[0];
}

export function shippingCost(id: ShippingMethodId, subtotal: number): number {
  const method = getShippingMethod(id);
  if (subtotal <= 0) return 0;
  if (method.freeFrom !== null && subtotal >= method.freeFrom) return 0;
  return method.price;
}

export const PAYMENT_METHODS = [
  {
    id: "tarjeta",
    label: "Tarjeta de crédito o débito",
    description: "Te redirigiremos a la pasarela de pago para completar la compra.",
  },
  {
    id: "transferencia",
    label: "Transferencia bancaria",
    description: "Te enviaremos los datos por correo. El pedido se reserva por 48 horas.",
  },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export function isPaymentMethodId(value: unknown): value is PaymentMethodId {
  return PAYMENT_METHODS.some((m) => m.id === value);
}

type PricedLine = { unitPrice: number; listPrice: number; quantity: number };

export type CartTotals = {
  itemCount: number;
  /** Suma a precio final (con ofertas aplicadas). */
  subtotal: number;
  /** Cuánto se ahorra respecto al precio normal. */
  savings: number;
  shipping: number;
  total: number;
};

export function cartTotals(lines: PricedLine[], shippingId: ShippingMethodId = DEFAULT_SHIPPING): CartTotals {
  let itemCount = 0;
  let subtotal = 0;
  let listTotal = 0;
  for (const l of lines) {
    itemCount += l.quantity;
    subtotal += l.unitPrice * l.quantity;
    listTotal += l.listPrice * l.quantity;
  }
  const shipping = shippingCost(shippingId, subtotal);
  return { itemCount, subtotal, savings: listTotal - subtotal, shipping, total: subtotal + shipping };
}
