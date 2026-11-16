import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  allProductIds,
  getPublicProduct,
  listRelatedProducts,
} from "@/lib/marketplace/data";
import { DiscountTag, PublicProductCard } from "@/components/marketplace/product-card";
import { ProductGallery } from "./product-gallery";
import { PurchasePanel } from "./purchase-panel";

/** Todas las páginas se generan en el build. */
export function generateStaticParams() {
  return allProductIds().map((productId) => ({ productId }));
}

type Props = { params: Promise<{ productId: string }> };

export async function generateMetadata({ params }: Props) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.detail ?? product.description?.slice(0, 160) ?? undefined,
  };
}

export default async function PublicProductPage({ params }: Props) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);
  if (!product) notFound();

  const related = await listRelatedProducts(product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <Link
        href="/#catalogo"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al catálogo
      </Link>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <ProductGallery
          images={product.images}
          name={product.name}
          badge={<DiscountTag product={product} className="absolute left-3 top-3 text-sm" />}
        />
        <PurchasePanel product={product} />
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Más de {product.store.name}
          </h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
            {related.map((p) => (
              <PublicProductCard key={p.id} product={p} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
