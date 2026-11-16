import Link from "next/link";
import { Dumbbell, Flame, Gem, Laptop, Sofa, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SWATCH, type SwatchTone } from "@/components/marketplace/swatches";

/**
 * Mosaico de tendencias: una tarjeta grande a la izquierda y cuatro chicas a
 * la derecha. Las "imágenes" se emulan con degradados y formas; para usar
 * fotos reales, agrega `image` (ruta en /public o URL) a la tarjeta.
 */
type Trend = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Tono de la paleta `swatch-*` de tokens.yml. */
  tone: SwatchTone;
  image?: string;
};

const TRENDS: Trend[] = [
  {
    label: "Lo más vendido en Tecnología",
    href: "/categoria/tecnologia",
    icon: Laptop,
    tone: 6,
  },
  {
    label: "Hogar con estilo",
    href: "/categoria/hogar",
    icon: Sofa,
    tone: 3,
  },
  {
    label: "Accesorios del momento",
    href: "/categoria/accesorios",
    icon: Gem,
    tone: 2,
  },
  {
    label: "Ofertas virales",
    href: "/#recomendados",
    icon: Flame,
    tone: 4,
  },
  {
    label: "Vida activa",
    href: "/categoria/deporte",
    icon: Dumbbell,
    tone: 7,
  },
];

export function TrendsSection() {
  const [featured, ...rest] = TRENDS;

  return (
    <section aria-labelledby="tendencias" className="border-t py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="tendencias" className="text-balance text-2xl font-bold tracking-tight md:text-3xl">
          Las tendencias que están marcando la diferencia
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Descubre los productos y categorías más destacados del momento.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4 md:grid-rows-2">
        <TrendCard trend={featured} isFeatured className="md:col-span-2 md:row-span-2" />
        {rest.map((trend) => (
          <TrendCard key={trend.label} trend={trend} />
        ))}
      </div>
    </section>
  );
}

function TrendCard({
  trend,
  isFeatured,
  className,
}: {
  trend: Trend;
  isFeatured?: boolean;
  className?: string;
}) {
  const Icon = trend.icon;

  return (
    <Link
      href={trend.href}
      className={cn(
        "group relative isolate block overflow-hidden rounded-[calc(var(--radius)+6px)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isFeatured ? "aspect-[4/3] md:aspect-auto md:min-h-[22rem]" : "aspect-[2/1] md:aspect-auto md:min-h-[10.5rem]",
        className,
      )}
    >
      {/* Fondo: foto real si existe; si no, degradado con formas decorativas. */}
      <div className="absolute inset-0 -z-10 transition-transform duration-500 ease-out group-hover:scale-105">
        {trend.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagen decorativa configurable
          <img src={trend.image} alt="" className="size-full object-cover" />
        ) : (
          <div className={cn("relative size-full bg-gradient-to-br", SWATCH[trend.tone])}>
            <span className="absolute -right-10 -top-10 size-48 rounded-full bg-on-media/15" />
            <span className="absolute -bottom-16 left-1/4 size-56 rounded-full bg-overlay/10" />
            {/* Anillo punteado, como el adorno de la referencia. */}
            <span className="absolute right-8 top-6 size-20 rounded-full border-4 border-dotted border-on-media/50" />
            <Icon
              aria-hidden
              strokeWidth={1.25}
              className={cn(
                "absolute bottom-0 right-0 translate-x-[10%] translate-y-[10%] text-on-media/85 drop-shadow-xl",
                isFeatured ? "size-64 md:size-80" : "size-32",
              )}
            />
          </div>
        )}
      </div>

      {/* Pestaña negra con ícono y nombre, arriba a la izquierda. */}
      <span className="absolute left-0 top-0 inline-flex max-w-[85%] items-center gap-2 rounded-br-2xl bg-overlay py-1.5 pl-3 pr-4 text-sm font-medium text-on-media">
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-on-media text-overlay">
          <Icon className="size-3.5" />
        </span>
        <span className="truncate">{trend.label}</span>
      </span>
    </Link>
  );
}
