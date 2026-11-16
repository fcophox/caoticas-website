import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Carro", "Datos y envío", "Confirmación"] as const;

/** Migas del flujo de compra. `current` es el índice del paso activo. */
export function CheckoutSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Pasos de la compra">
      {STEPS.map((step, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <li key={step} className="flex items-center gap-2" aria-current={isActive ? "step" : undefined}>
            {i > 0 && <span aria-hidden className="h-px w-4 bg-border sm:w-8" />}
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full border text-xs font-semibold tabular-nums",
                isActive && "border-primary bg-primary text-primary-foreground",
                isDone && "border-foreground/30 bg-muted",
              )}
            >
              {isDone ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("hidden sm:inline", isActive ? "font-medium" : "text-muted-foreground")}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
