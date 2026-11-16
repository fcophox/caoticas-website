"use client";

/**
 * Estado del carrito en el navegador.
 *
 * Vive en `localStorage` (sobrevive a recargas y se sincroniza entre
 * pestañas) y se lee con `useSyncExternalStore`, así que el servidor siempre
 * pinta el carrito vacío y el cliente lo completa tras hidratar, sin
 * mismatch.
 *
 * Cada línea guarda una "foto" del producto (nombre, precio, imagen) para
 * poder dibujar el carrito sin pedir nada; el precio que vale es el que
 * recalcula el servidor al confirmar el pedido.
 */
import { useSyncExternalStore } from "react";
import { MAX_QUANTITY } from "./pricing";
import { effectivePrice } from "@/components/marketplace/product-card";
import type { MarketplaceProduct } from "@/lib/marketplace/data";

export type CartItem = {
  productId: string;
  name: string;
  detail: string | null;
  imageUrl: string | null;
  /** Precio final por unidad (con oferta si la hay). */
  unitPrice: number;
  /** Precio normal por unidad, para mostrar el ahorro. */
  listPrice: number;
  quantity: number;
};

export type PriceUpdate =
  | { productId: string; removed: true }
  | { productId: string; removed?: false; unitPrice: number; listPrice: number };

const STORAGE_KEY = "mkt-cart-v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function clampQuantity(q: number) {
  return Math.max(1, Math.min(MAX_QUANTITY, Math.floor(q)));
}

function isCartItem(v: unknown): v is CartItem {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.productId === "string" &&
    typeof o.name === "string" &&
    typeof o.unitPrice === "number" &&
    typeof o.listPrice === "number" &&
    typeof o.quantity === "number"
  );
}

function parse(raw: string | null): CartItem[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    return value.filter(isCartItem).map((i) => ({ ...i, quantity: clampQuantity(i.quantity) }));
  } catch {
    return EMPTY;
  }
}

function emit() {
  for (const l of listeners) l();
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  items = parse(localStorage.getItem(STORAGE_KEY));
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    items = parse(e.newValue);
    emit();
  });
}

function commit(next: CartItem[]) {
  items = next.length ? next : EMPTY;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Modo privado o cuota llena: el carrito sigue funcionando en memoria.
  }
  emit();
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  load();
  return items;
}

function getServerSnapshot() {
  return EMPTY;
}

/** Líneas del carrito. Vacío en el servidor y durante la hidratación. */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noopSubscribe = () => () => {};

/**
 * `false` en el servidor y durante la hidratación, `true` después. Sirve para
 * mostrar un esqueleto en vez de "tu carro está vacío" mientras se lee
 * `localStorage`.
 */
export function useCartReady(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function toCartItem(p: MarketplaceProduct, quantity = 1): CartItem {
  return {
    productId: p.id,
    name: p.name,
    detail: p.detail,
    imageUrl: p.imageUrl,
    unitPrice: effectivePrice(p),
    listPrice: p.price,
    quantity: clampQuantity(quantity),
  };
}

export const cart = {
  /** Suma unidades si el producto ya está; si no, lo agrega al final. */
  add(item: CartItem) {
    load();
    const existing = items.find((i) => i.productId === item.productId);
    if (existing) {
      commit(
        items.map((i) =>
          i.productId === item.productId
            ? { ...item, quantity: clampQuantity(i.quantity + item.quantity) }
            : i,
        ),
      );
    } else {
      commit([...items, { ...item, quantity: clampQuantity(item.quantity) }]);
    }
  },

  setQuantity(productId: string, quantity: number) {
    load();
    if (quantity < 1) return cart.remove(productId);
    commit(items.map((i) => (i.productId === productId ? { ...i, quantity: clampQuantity(quantity) } : i)));
  },

  remove(productId: string) {
    load();
    commit(items.filter((i) => i.productId !== productId));
  },

  /** Aplica los precios vigentes que devolvió el servidor. */
  applyUpdates(updates: PriceUpdate[]) {
    load();
    const byId = new Map(updates.map((u) => [u.productId, u]));
    commit(
      items.flatMap((i) => {
        const u = byId.get(i.productId);
        if (!u) return [i];
        if (u.removed) return [];
        return [{ ...i, unitPrice: u.unitPrice, listPrice: u.listPrice }];
      }),
    );
  },

  clear() {
    load();
    commit(EMPTY);
  },
};

/* ── Panel lateral ───────────────────────────────────────────────────────── */

let drawerOpen = false;
const drawerListeners = new Set<() => void>();

function setDrawer(open: boolean) {
  if (drawerOpen === open) return;
  drawerOpen = open;
  for (const l of drawerListeners) l();
}

export function openCartDrawer() {
  setDrawer(true);
}

export function closeCartDrawer() {
  setDrawer(false);
}

export function useCartDrawer(): boolean {
  return useSyncExternalStore(
    (l) => {
      drawerListeners.add(l);
      return () => {
        drawerListeners.delete(l);
      };
    },
    () => drawerOpen,
    () => false,
  );
}
