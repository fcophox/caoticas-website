import { BadgePercent, LayoutGrid, Package, Truck } from "lucide-react";
import {
  listPublicCategories,
  listPublicCollections,
  listPublicProducts,
} from "@/lib/marketplace/data";
import { hasOffer } from "@/components/marketplace/product-card";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/app-config";
import { HeroCarousel } from "./hero-carousel";
import { RecommendedProducts } from "./recommended-products";
import { TrendsSection } from "./trends-section";
import { CategoryCircles, withCounts } from "./category-circles";

export const metadata = {
  title: { absolute: APP_NAME },
  description: APP_DESCRIPTION,
};

export default async function MarketplaceHome() {
  const [products, categories, collections] = await Promise.all([
    listPublicProducts(),
    listPublicCategories(),
    listPublicCollections(),
  ]);
  const offerCount = products.filter(hasOffer).length;
  const categoryCount = withCounts(categories, products).length;

  const highlights = [
    { icon: Package, label: `${products.length} productos` },
    // Sin ofertas vigentes se muestra cuántas categorías hay en vez de "0 ofertas".
    offerCount > 0
      ? { icon: BadgePercent, label: `${offerCount} ${offerCount === 1 ? "oferta" : "ofertas"} activas` }
      : { icon: LayoutGrid, label: `${categoryCount} categorías` },
    { icon: Truck, label: "Despacho a todo Chile" },
  ];

  return (
    <>
      <HeroCarousel
        highlights={
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4" />
                {label}
              </li>
            ))}
          </ul>
        }
      />

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <CategoryCircles categories={withCounts(categories, products)} />
        <TrendsSection />
        {/* Va al final de la portada: justo encima de "Cómo comprar". */}
        <RecommendedProducts collections={collections} />
      </div>
    </>
  );
}
