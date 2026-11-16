"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { images: string[]; name: string; badge?: React.ReactNode };

/**
 * Galería de la ficha: en escritorio muestra dos imágenes lado a lado con
 * flechas y miniaturas debajo; en celular, una a la vez. La imagen activa
 * siempre queda visible: si es la última, se ve junto a la anterior.
 */
export function ProductGallery({ images, name, badge }: Props) {
  const [active, setActive] = useState(0);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-[var(--radius)] border bg-muted text-muted-foreground md:aspect-[2/1]">
        <ImageOff className="size-8" />
      </div>
    );
  }

  const go = (next: number) => setActive((next + count) % count);
  const isPair = count > 1;
  // Ventana de 2 en escritorio: empieza en la activa salvo que sea la última.
  const start = isPair ? Math.min(active, count - 2) : 0;
  const visible = isPair ? [start, start + 1] : [0];

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className={cn("grid gap-3", isPair && "md:grid-cols-2")}>
          {visible.map((i) => (
            <div
              key={i}
              className={cn(
                "relative aspect-square overflow-hidden rounded-[var(--radius)] border bg-muted",
                // En celular sólo se ve la activa.
                i !== active && "hidden md:block",
                !isPair && "mx-auto w-full max-w-xl",
              )}
            >
              <Image
                src={images[i]}
                alt={`${name} — imagen ${i + 1} de ${count}`}
                fill
                unoptimized
                priority={i === 0}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              {i === 0 && badge}
            </div>
          ))}
        </div>

        {isPair && (
          <>
            <ArrowButton side="left" label="Imagen anterior" onClick={() => go(active - 1)} />
            <ArrowButton side="right" label="Imagen siguiente" onClick={() => go(active + 1)} />
          </>
        )}
      </div>

      {isPair && (
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Miniaturas">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-[calc(var(--radius)-2px)] border-2 bg-muted transition-colors md:size-20",
                  i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill unoptimized sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ArrowButton({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background",
        side === "left" ? "left-2" : "right-2",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
