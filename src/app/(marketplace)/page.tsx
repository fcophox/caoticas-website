import { BadgePercent, Package, Truck } from "lucide-react";
import {
  listPublicCategories,
  listPublicCollections,
  listPublicProducts,
} from "@/lib/marketplace/data";
import { hasOffer } from "@/components/marketplace/product-card";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/app-config";
import { MarketplaceCatalog } from "./marketplace-catalog";
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

  const highlights = [
    { icon: Package, label: `${products.length} productos` },
    { icon: BadgePercent, label: `${offerCount} ${offerCount === 1 ? "oferta" : "ofertas"} activas` },
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
        <MarketplaceCatalog products={products} />
        <TrendsSection />
        {/* Va al final de la portada: justo encima de "Cómo comprar". */}
        <RecommendedProducts collections={collections} />
      </div>
    </>
  );
}
