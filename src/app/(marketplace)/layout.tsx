import { Suspense } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartButton } from "@/components/cart/cart-button";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HeaderSearch } from "@/components/marketplace/header-search";
import { listPublicProducts } from "@/lib/marketplace/data";
import { HowItWorks } from "@/components/marketplace/how-it-works";
import { APP_NAME, THEME_TOGGLE_ENABLED } from "@/lib/app-config";

/** Marco del sitio: encabezado, contenido, "Cómo comprar" y pie. */
export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();
  // El buscador filtra en el navegador: con el catálogo actual es instantáneo.
  const products = await listPublicProducts();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:flex-nowrap md:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
            <ShoppingBag className="size-5" />
            {APP_NAME}
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

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p>
            © {year} {APP_NAME}. Todos los derechos reservados.
          </p>
          <p>Despachos a todo Chile · 30 días para cambios y devoluciones.</p>
        </div>
      </footer>
    </div>
  );
}

/** Mismo tamaño que el buscador mientras hidrata, para que el encabezado no salte. */
function SearchPlaceholder() {
  return (
    <div className="order-last h-10 w-full rounded-full border bg-muted/50 md:order-none md:mx-auto md:max-w-xl md:flex-1" />
  );
}
