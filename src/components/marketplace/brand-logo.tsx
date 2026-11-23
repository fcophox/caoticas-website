import Image from "next/image";
import { APP_NAME } from "@/lib/app-config";
import { cn } from "@/lib/utils";

/** Proporciones del archivo original (346 × 123). */
const LOGO_WIDTH = 346;
const LOGO_HEIGHT = 123;

/**
 * Logotipo de Caóticas. El tamaño se fija con la altura (`h-*`) en
 * `className`; el ancho sigue la proporción del archivo.
 */
export function BrandLogo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/caoticas-logotipo.svg"
      alt={APP_NAME}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      unoptimized
      className={cn("w-auto", className)}
    />
  );
}
