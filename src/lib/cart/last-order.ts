"use client";

/**
 * Último pedido confirmado, en `sessionStorage`, para que la página de
 * confirmación lo muestre tras redirigir. Cuando exista una API de pedidos,
 * la confirmación puede leerlo por número en vez de aquí.
 */
import type { PlacedOrder } from "@/lib/marketplace/orders";

const KEY = "mkt-last-order";

export function saveLastOrder(order: PlacedOrder) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    // Sin almacenamiento la confirmación muestra el mensaje genérico.
  }
}

let cachedRaw: string | null = null;
let cachedOrder: PlacedOrder | null = null;

/** Devuelve el mismo objeto mientras no cambie lo guardado (apto para useSyncExternalStore). */
export function readLastOrder(): PlacedOrder | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedOrder = raw ? (JSON.parse(raw) as PlacedOrder) : null;
    }
    return cachedOrder;
  } catch {
    return null;
  }
}
