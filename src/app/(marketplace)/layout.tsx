import Link from "next/link";
import { Store } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartButton } from "@/components/cart/cart-button";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HowItWorks } from "@/components/marketplace/how-it-works";
import { APP_NAME } from "@/lib/app-config";

/** Marco del sitio: encabezado, contenido, "Cómo comprar" y pie. */
export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Store className="size-5" />
            {APP_NAME}
          </Link>

          <nav className="ml-auto flex items-center gap-2">
            <Link
              href="/#catalogo"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Catálogo
            </Link>
            <ThemeToggle />
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
          <p>¿Quieres vender aquí? Escríbenos y te creamos tu tienda.</p>
        </div>
      </footer>
    </div>
  );
}
