import Link from "next/link";
import {
  Dumbbell,
  Gem,
  Laptop,
  NotebookPen,
  Shirt,
  Sofa,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SWATCH } from "@/components/marketplace/swatches";
import type { MarketplaceCategory } from "@/lib/marketplace/data";

/**
 * Aspecto de cada categoría cuando no tiene imagen propia (`image_path`).
 * Una categoría nueva sin entrada aquí usa el ícono y degradado por defecto.
 */
const FALLBACK: Record<string, { icon: LucideIcon; gradient: string }> = {
  ropa: { icon: Shirt, gradient: SWATCH[1] },
  accesorios: { icon: Gem, gradient: SWATCH[2] },
  hogar: { icon: Sofa, gradient: SWATCH[3] },
  papeleria: { icon: NotebookPen, gradient: SWATCH[4] },
  despensa: { icon: UtensilsCrossed, gradient: SWATCH[5] },
  tecnologia: { icon: Laptop, gradient: SWATCH[6] },
  deporte: { icon: Dumbbell, gradient: SWATCH[7] },
};
const DEFAULT_LOOK = { icon: Tag, gradient: SWATCH[6] };

export type CategoryWithCount = MarketplaceCategory & { count: number };

type Props = {
  categories: CategoryWithCount[];
  /** Categoría que se está viendo (en su página interna), para marcarla. */
  activeSlug?: string;
  title?: string;
};

/** Cuenta productos por categoría y descarta las vacías: un círculo que lleva a "nada" frustra. */
export function withCounts(
  categories: MarketplaceCategory[],
  products: { category: { slug: string } | null }[],
): CategoryWithCount[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.category) counts.set(p.category.slug, (counts.get(p.category.slug) ?? 0) + 1);
  }
  return categories
    .map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }))
    .filter((c) => c.count > 0);
}

export function CategoryCircles({
  categories,
  activeSlug,
  title = "Revisa nuestras categorías",
}: Props) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="categorias" className="py-10 md:py-14">
      <h2
        id="categorias"
        className="text-center text-2xl font-bold tracking-tight md:text-3xl"
      >
        {title}
      </h2>

      {/* En celular se desliza horizontalmente; en escritorio queda centrado. */}
      <ul className="-mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:mt-8 md:flex-wrap md:justify-center md:gap-8 md:overflow-visible md:px-0">
        {categories.map((c) => {
          const isSelected = activeSlug === c.slug;
          const look = FALLBACK[c.slug] ?? DEFAULT_LOOK;
          const Icon = look.icon;
          return (
            <li key={c.slug} className="snap-start">
              <Link
                href={`/categoria/${c.slug}`}
                aria-current={isSelected ? "page" : undefined}
                className="group flex w-18 flex-col items-center gap-2 text-center focus-visible:outline-none md:w-32 md:gap-3"
              >
                <span
                  className={cn(
                    "relative block size-16 overflow-hidden rounded-full ring-offset-2 ring-offset-background md:ring-offset-4 transition-[box-shadow,transform] duration-200 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-ring md:size-32",
                    isSelected && "ring-2 ring-primary",
                  )}
                >
                  {c.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element -- ruta pública o URL externa configurable
                    <img
                      src={c.imagePath}
                      alt=""
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      className={cn(
                        "grid size-full place-items-center bg-gradient-to-br text-on-media transition-transform duration-300 group-hover:scale-105",
                        look.gradient,
                      )}
                    >
                      <Icon className="size-7 md:size-12" strokeWidth={1.5} />
                    </span>
                  )}
                </span>
                <span className="text-xs font-medium leading-tight md:text-sm">
                  {c.name}
                  <span className="mt-0.5 block text-[0.7rem] font-normal text-muted-foreground md:text-xs">
                    {c.count} {c.count === 1 ? "producto" : "productos"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
