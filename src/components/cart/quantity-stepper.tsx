"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { MAX_QUANTITY } from "@/lib/cart/pricing";
import { cn } from "@/lib/utils";

/**
 * − cantidad +. Con `onRemove`, en 1 el botón "−" se vuelve papelera y quita
 * la línea; sin él, el mínimo es 1.
 */
export function QuantityStepper({
  value,
  onChange,
  onRemove,
  label,
  size = "md",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  onRemove?: () => void;
  /** Nombre del producto, para los lectores de pantalla. */
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const atMin = value <= 1;
  const atMax = value >= MAX_QUANTITY;
  const btn = cn(
    "grid place-items-center rounded-full transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
    size === "sm" ? "size-7" : "size-9",
  );
  const icon = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div
      role="group"
      aria-label={`Cantidad de ${label}`}
      className={cn("inline-flex items-center gap-1 rounded-full border p-0.5", className)}
    >
      {atMin && onRemove ? (
        <button type="button" className={btn} onClick={onRemove} aria-label={`Quitar ${label}`}>
          <Trash2 className={icon} />
        </button>
      ) : (
        <button
          type="button"
          className={btn}
          onClick={() => onChange(value - 1)}
          disabled={atMin}
          aria-label="Quitar una unidad"
        >
          <Minus className={icon} />
        </button>
      )}
      <span
        aria-live="polite"
        className={cn("min-w-6 text-center font-medium tabular-nums", size === "sm" ? "text-sm" : "text-base")}
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={atMax}
        aria-label="Agregar una unidad"
        title={atMax ? `Máximo ${MAX_QUANTITY} unidades` : undefined}
      >
        <Plus className={icon} />
      </button>
    </div>
  );
}
