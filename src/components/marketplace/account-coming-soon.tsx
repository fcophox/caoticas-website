import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCOUNT_LINKS } from "@/lib/app-config";

type Props = {
  mode: "login" | "signup";
};

/**
 * Página provisoria de /ingresar y /registro mientras el sitio no tiene
 * cuentas. Hoy se compra sin cuenta: los datos se piden en el checkout.
 */
export function AccountComingSoon({ mode }: Props) {
  const isLogin = mode === "login";
  const title = isLogin ? "Ingresa a tu cuenta" : "Crea tu cuenta";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center md:py-24">
      <span className="grid size-16 place-items-center rounded-full bg-brand-gradient text-foreground">
        <UserRound className="size-7" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-pretty text-muted-foreground">
        Muy pronto vas a poder tener tu cuenta en Caóticas. Mientras tanto puedes comprar sin
        registrarte: sólo te pedimos tus datos al pagar.
      </p>
      <Button asChild className="mt-6">
        <Link href="/catalogo">Ver catálogo</Link>
      </Button>
      <p className="mt-6 text-sm text-muted-foreground">
        {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <Link
          href={isLogin ? ACCOUNT_LINKS.signup : ACCOUNT_LINKS.login}
          className="font-semibold text-foreground underline-offset-2 hover:underline"
        >
          {isLogin ? "Regístrate" : "Ingresa"}
        </Link>
      </p>
    </div>
  );
}
