import { Suspense } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartButton } from "@/components/cart/cart-button";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HeaderSearch } from "@/components/marketplace/header-search";
import { listPublicCategories, listPublicProducts } from "@/lib/marketplace/data";
import { SiteFooter } from "@/components/marketplace/site-footer";
import { HowItWorks } from "@/components/marketplace/how-it-works";
import { BrandLogo } from "@/components/marketplace/brand-logo";
import { APP_NAME, THEME_TOGGLE_ENABLED } from "@/lib/app-config";

/** Marco del sitio: encabezado, contenido, "Cómo comprar" y pie. */
export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  // El buscador filtra en el navegador: con el catálogo actual es instantáneo.
  const [products, allCategories] = await Promise.all([listPublicProducts(), listPublicCategories()]);
  // En el pie sólo las categorías que tienen productos.
  const usedSlugs = new Set(products.map((p) => p.category?.slug));
  const categories = allCategories.filter((c) => usedSlugs.has(c.slug));

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:flex-nowrap md:px-6">
          <Link href="/" aria-label={`${APP_NAME}, ir al inicio`} className="flex shrink-0 items-center">
            <BrandLogo priority className="h-9" />
          </Link>

          {/* En celular baja a su propia fila, a todo el ancho. */}
          <Suspense fallback={<SearchPlaceholder />}>
            <HeaderSearch
              products={products}
              className="order-last w-full md:order-none md:mx-auto md:max-w-xl md:flex-1"
            />
          </Suspense>

          <nav className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            <Link
              href="/#catalogo"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Catálogo
            </Link>
            {THEME_TOGGLE_ENABLED && <ThemeToggle />}
            <CartButton />
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <CartDrawer />

      <HowItWorks />

      <SiteFooter categories={categories} />
    </div>
  );
}

/** Mismo tamaño que el buscador mientras hidrata, para que el encabezado no salte. */
function SearchPlaceholder() {
  return (
    <div className="order-last h-10 w-full rounded-full border bg-muted/50 md:order-none md:mx-auto md:max-w-xl md:flex-1" />
  );
}
