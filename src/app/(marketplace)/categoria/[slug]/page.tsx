import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  allCategorySlugs,
  listPublicCategories,
  listPublicProducts,
} from "@/lib/marketplace/data";
import { hasOffer } from "@/components/marketplace/product-card";
import { MarketplaceCatalog } from "../../marketplace-catalog";
import { CategoryCircles, withCounts } from "../../category-circles";

/** Todas las páginas se generan en el build. */
export async function generateStaticParams() {
  return (await allCategorySlugs()).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

async function loadCategory(slug: string) {
  const [categories, products] = await Promise.all([
    listPublicCategories(),
    listPublicProducts(),
  ]);
  const category = categories.find((c) => c.slug === slug.toLowerCase());
  return { category, categories, products };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { category } = await loadCategory(slug);
  if (!category) return { title: "Categoría no encontrada" };
  return {
    title: category.name,
    description: `Productos de ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const { category, categories, products } = await loadCategory(slug);
  if (!category) notFound();

  const items = products.filter((p) => p.category?.slug === category.slug);
  const offers = items.filter(hasOffer).length;
  // Las demás categorías con productos, para seguir explorando.
  const others = withCounts(categories, products).filter((c) => c.slug !== category.slug);

  return (
    <>
      <section className="border-b bg-brand-gradient">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <nav aria-label="Ruta" className="flex items-center gap-1 text-sm text-foreground/75">
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/#categorias" className="hover:text-foreground">
              Categorías
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground" aria-current="page">
              {category.name}
            </span>
          </nav>

          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{category.name}</h1>
          <p className="mt-2 text-foreground/75">
            {items.length} {items.length === 1 ? "producto" : "productos"}
            {offers > 0 && ` · ${offers} ${offers === 1 ? "oferta" : "ofertas"}`}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <MarketplaceCatalog
          products={items}
          title={`Productos de ${category.name}`}
          emptyMessage="Todavía no hay productos en esta categoría."
        />

        {others.length > 0 && (
          <div className="border-t">
            <CategoryCircles categories={others} title="Explora otras categorías" />
          </div>
        )}
      </div>
    </>
  );
}
