import { House, MousePointerClick, ShoppingCart, Truck } from "lucide-react";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Selecciona tu producto",
    text: "Recorre el catálogo, usa el buscador y los filtros, y elige lo que más te guste.",
  },
  {
    icon: ShoppingCart,
    title: "Haz tu pedido",
    text: "Confirma el producto, la cantidad y tus datos de despacho en pocos pasos.",
  },
  {
    icon: Truck,
    title: "Te enviamos el pedido",
    text: "La tienda prepara tu compra y la despacha. Te avisamos cuando vaya en camino.",
  },
  {
    icon: House,
    title: "Lo recibes en tu casa",
    text: "Tu pedido llega directo a tu puerta. Solo queda disfrutarlo.",
  },
];

/** Sección explicativa "Cómo comprar". Va al final de cada página del marketplace. */
export function HowItWorks() {
  return (
    <section aria-labelledby="como-comprar" className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">Cómo comprar</p>
          <h2 id="como-comprar" className="mt-2 text-balance text-3xl font-bold tracking-tight">
            Comprar es fácil, en 4 pasos
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Del catálogo a tu puerta, sin complicaciones.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="relative flex flex-col rounded-[var(--radius)] border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-4xl font-bold tabular-nums text-muted-foreground/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
