import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { POLICIES } from "@/lib/app-config";

/**
 * Marco de las páginas legales: título, fecha de actualización, índice y
 * secciones con ancla (`#id`) para poder enlazarlas desde otras páginas.
 *
 * Los textos son una base estándar para un catálogo online en Chile. Antes de
 * operar con ventas reales conviene que los revise un abogado y completar
 * razón social, RUT y domicilio.
 */
export type LegalSection = { id: string; title: string; body: React.ReactNode };

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al inicio
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: {POLICIES.legalUpdatedAt}</p>
      <div className="mt-6 text-pretty text-muted-foreground">{intro}</div>

      <nav aria-label="Contenido" className="mt-8 rounded-[var(--radius)] border bg-card p-5">
        <p className="text-sm font-semibold">Contenido</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-3 space-y-3 text-pretty leading-relaxed text-muted-foreground [&_li]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_strong]:text-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
