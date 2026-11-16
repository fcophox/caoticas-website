"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Diapositivas del hero. Para usar fotos reales, deja los archivos en
 * `public/hero/` y cambia `image` (jpg/webp de ~1600×800 funcionan bien).
 */
const SLIDES = [
  {
    image: "/hero/slide-1.svg",
    eyebrow: "Catálogo",
    title: "Descubre productos de cuidado personal",
    text: "Explora el catálogo, compara precios y encuentra las mejores ofertas.",
    cta: "Ver catálogo",
  },
  {
    image: "/hero/slide-2.svg",
    eyebrow: "Bubbaluu",
    title: "Cuidado para tu cabello, rostro y cuerpo",
    text: "Ampollas, mascarillas, cremas y más, con aromas frutales.",
    cta: "Ver productos",
  },
  {
    image: "/hero/slide-3.svg",
    eyebrow: "Envíos",
    title: "Elige, pide y recíbelo en la puerta de tu casa",
    text: "Preparamos tu pedido y te lo despachamos sin complicaciones.",
    cta: "Empezar a comprar",
  },
];

const INTERVAL_MS = 6000;

type Props = { highlights: React.ReactNode };

export function HeroCarousel({ highlights }: Props) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Con "reducir movimiento" activado no se rota sola: el usuario navega a mano.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setIsPaused(true);
  }, []);

  useEffect(() => {
    if (isPaused || isHovered) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPaused, isHovered, index]);

  const go = (next: number) => setIndex((next + SLIDES.length) % SLIDES.length);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados"
      className="relative isolate overflow-hidden border-b text-on-media"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {/* Fondos: se apilan y se funden entre sí con un leve zoom. */}
      {SLIDES.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- fondo decorativo estático
        <img
          key={slide.image}
          src={slide.image}
          alt=""
          aria-hidden
          className={cn(
            "absolute inset-0 -z-20 size-full object-cover transition-[opacity,transform] duration-[1200ms] ease-out motion-reduce:transition-none",
            i === index ? "scale-100 opacity-100" : "scale-105 opacity-0",
          )}
        />
      ))}
      {/* Velo para que el texto blanco siempre tenga contraste. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-overlay/70 via-overlay/40 to-overlay/10" />

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Los textos comparten celda de grilla: la altura la fija el más largo y nada salta. */}
        <div className="grid min-h-[22rem] items-center py-14 md:min-h-[28rem] md:py-20">
          {SLIDES.map((slide, i) => {
            const isActive = i === index;
            // Un solo <h1> en la página: el de la primera diapositiva.
            const Heading = i === 0 ? "h1" : "p";
            return (
              <div
                key={slide.title}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`${i + 1} de ${SLIDES.length}`}
                aria-hidden={!isActive}
                inert={!isActive}
                className={cn(
                  "col-start-1 row-start-1 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
                  isActive ? "translate-y-0 opacity-100 delay-200" : "translate-y-4 opacity-0",
                )}
              >
                <p className="text-sm font-medium uppercase tracking-widest text-on-media/75">
                  {slide.eyebrow}
                </p>
                <Heading className="mt-3 max-w-2xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
                  {slide.title}
                </Heading>
                <p className="mt-4 max-w-xl text-pretty text-on-media/85 md:text-lg">{slide.text}</p>
                <a
                  href="#catalogo"
                  className="mt-7 inline-flex h-10 items-center rounded-[var(--radius)] bg-on-media px-5 text-sm font-semibold text-overlay transition-colors hover:bg-on-media/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-media focus-visible:ring-offset-2 focus-visible:ring-offset-overlay"
                >
                  {slide.cta}
                </a>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
          <div className="text-on-media/85">{highlights}</div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Elegir diapositiva">
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.image}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Ir a la diapositiva ${i + 1}`}
                  onClick={() => go(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-6 bg-on-media" : "w-2 bg-on-media/45 hover:bg-on-media/70",
                  )}
                />
              ))}
            </div>
            <CarouselButton label="Anterior" onClick={() => go(index - 1)}>
              <ChevronLeft className="size-4" />
            </CarouselButton>
            <CarouselButton label="Siguiente" onClick={() => go(index + 1)}>
              <ChevronRight className="size-4" />
            </CarouselButton>
            <CarouselButton
              label={isPaused ? "Reanudar carrusel" : "Pausar carrusel"}
              onClick={() => setIsPaused((p) => !p)}
            >
              {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </CarouselButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full border border-on-media/30 bg-overlay/20 backdrop-blur transition-colors hover:bg-overlay/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-media"
    >
      {children}
    </button>
  );
}
