import Image from "next/image";
import { APP_NAME } from "@/lib/app-config";
import { cn } from "@/lib/utils";

/**
 * Versiones del logotipo, con las proporciones de cada archivo original:
 * - `header`: sólo la placa con el nombre (navbar).
 * - `footer`: la gata asomándose sobre la placa (pie de página).
 */
const LOGOS = {
  header: { src: "/brand/caoticas-logotipo.svg", width: 346, height: 123 },
  footer: { src: "/brand/caoticas-logotipo-footer.svg", width: 366, height: 269 },
} as const;

type Props = {
  variant?: keyof typeof LOGOS;
  className?: string;
  priority?: boolean;
};

/**
 * Logotipo de Caóticas. El tamaño se fija con la altura (`h-*`) en
 * `className`; el ancho sigue la proporción del archivo.
 */
export function BrandLogo({ variant = "header", className, priority }: Props) {
  const logo = LOGOS[variant];
  return (
    <Image
      src={logo.src}
      alt={APP_NAME}
      width={logo.width}
      height={logo.height}
      priority={priority}
      unoptimized
      className={cn("w-auto", className)}
    />
  );
}
