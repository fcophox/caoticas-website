"use server";

/**
 * Creación de pedidos (Server Action).
 *
 * El navegador sólo manda qué productos y cuántos, más los datos de
 * despacho: los precios se recalculan aquí desde el catálogo, nunca se
 * confía en los del carrito. Si alguno cambió o el producto ya no existe, se
 * rechaza el pedido y se devuelven los valores vigentes para que el carrito
 * se actualice y el cliente vuelva a confirmar.
 *
 * Hoy no hay base de datos ni pasarela: el pedido se valida, se numera y se
 * devuelve. Para producción, guardar el pedido y crear la transacción de pago
 * en el punto marcado con TODO; la firma de `placeOrder` no tiene que cambiar.
 */
import { getPublicProduct } from "./data";
import {
  MAX_QUANTITY,
  cartTotals,
  isPaymentMethodId,
  isShippingMethodId,
  type PaymentMethodId,
  type ShippingMethodId,
} from "@/lib/cart/pricing";
import { REGIONS } from "@/lib/cart/regions";

export type CheckoutContact = {
  email: string;
  name: string;
  phone: string;
};

export type CheckoutAddress = {
  street: string;
  apartment: string;
  commune: string;
  region: string;
  notes: string;
};

export type CheckoutInput = {
  lines: { productId: string; quantity: number; unitPrice: number }[];
  contact: CheckoutContact;
  address: CheckoutAddress;
  shippingMethod: ShippingMethodId;
  paymentMethod: PaymentMethodId;
};

export type OrderLine = {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
};

export type PlacedOrder = {
  number: string;
  createdAt: string;
  contact: CheckoutContact;
  address: CheckoutAddress;
  shippingMethod: ShippingMethodId;
  paymentMethod: PaymentMethodId;
  lines: OrderLine[];
  subtotal: number;
  savings: number;
  shipping: number;
  total: number;
};

export type FieldErrors = Partial<Record<keyof CheckoutContact | keyof CheckoutAddress, string>>;

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder }
  | {
      ok: false;
      error: string;
      fieldErrors?: FieldErrors;
      /** Precios vigentes / productos retirados, para refrescar el carrito. */
      updates?: (
        | { productId: string; removed: true }
        | { productId: string; removed?: false; unitPrice: number; listPrice: number }
      )[];
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{8,16}$/;

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function validateFields(contact: CheckoutContact, address: CheckoutAddress): FieldErrors {
  const e: FieldErrors = {};
  if (!EMAIL_RE.test(contact.email)) e.email = "Ingresa un correo válido.";
  if (contact.name.length < 3) e.name = "Ingresa tu nombre y apellido.";
  if (!PHONE_RE.test(contact.phone)) e.phone = "Ingresa un teléfono válido, por ejemplo +56 9 1234 5678.";
  if (address.street.length < 5) e.street = "Ingresa calle y número.";
  if (address.commune.length < 2) e.commune = "Ingresa tu comuna.";
  if (!(REGIONS as readonly string[]).includes(address.region)) e.region = "Elige una región.";
  return e;
}

function orderNumber() {
  const d = new Date();
  const date = `${d.getFullYear() % 100}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PED-${date}-${rand}`;
}

export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  // Lo que llega del navegador no está tipado de verdad: se normaliza todo.
  const contact: CheckoutContact = {
    email: str(input?.contact?.email).toLowerCase(),
    name: str(input?.contact?.name, 120),
    phone: str(input?.contact?.phone, 20),
  };
  const address: CheckoutAddress = {
    street: str(input?.address?.street),
    apartment: str(input?.address?.apartment, 60),
    commune: str(input?.address?.commune, 80),
    region: str(input?.address?.region, 80),
    notes: str(input?.address?.notes, 300),
  };

  const fieldErrors = validateFields(contact, address);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Revisa los campos marcados.", fieldErrors };
  }
  if (!isShippingMethodId(input?.shippingMethod) || !isPaymentMethodId(input?.paymentMethod)) {
    return { ok: false, error: "Elige un método de envío y de pago." };
  }

  const rawLines = Array.isArray(input?.lines) ? input.lines.slice(0, 50) : [];
  if (rawLines.length === 0) return { ok: false, error: "Tu carro está vacío." };

  const lines: (OrderLine & { listPrice: number })[] = [];
  const updates: NonNullable<Extract<PlaceOrderResult, { ok: false }>["updates"]> = [];

  for (const raw of rawLines) {
    const quantity = Math.floor(Number(raw?.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { ok: false, error: `Puedes llevar entre 1 y ${MAX_QUANTITY} unidades por producto.` };
    }
    const product = await getPublicProduct(str(raw?.productId, 120));
    if (!product) {
      updates.push({ productId: str(raw?.productId, 120), removed: true });
      continue;
    }
    const unitPrice = product.salePrice !== null && product.salePrice < product.price ? product.salePrice : product.price;
    if (unitPrice !== raw.unitPrice) {
      updates.push({ productId: product.id, unitPrice, listPrice: product.price });
    }
    lines.push({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPrice,
      listPrice: product.price,
      quantity,
    });
  }

  if (updates.length > 0) {
    return {
      ok: false,
      error: "Algunos productos cambiaron de precio o ya no están disponibles. Actualizamos tu carro: revísalo y confirma de nuevo.",
      updates,
    };
  }

  const totals = cartTotals(lines, input.shippingMethod);

  const order: PlacedOrder = {
    number: orderNumber(),
    createdAt: new Date().toISOString(),
    contact,
    address,
    shippingMethod: input.shippingMethod,
    paymentMethod: input.paymentMethod,
    lines: lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      imageUrl: l.imageUrl,
      unitPrice: l.unitPrice,
      quantity: l.quantity,
    })),
    subtotal: totals.subtotal,
    savings: totals.savings,
    shipping: totals.shipping,
    total: totals.total,
  };

  // TODO: guardar el pedido, descontar stock y crear la transacción de pago
  // (para "tarjeta", devolver aquí la URL de la pasarela y redirigir).

  return { ok: true, order };
}
