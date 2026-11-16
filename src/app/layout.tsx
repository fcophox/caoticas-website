import type { Metadata } from "next";
import { Arimo } from "next/font/google";
import "@/styles/globals.css";

import { ThemeScript } from "@/components/theme-script";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/app-config";
import { DEFAULT_THEME } from "@/lib/theme/mode";

// El nombre de la variable lo consume `fonts.sans` en tokens.yml.
const arimo = Arimo({
  subsets: ["latin", "latin-ext"],
  // Fuente variable: cubre del 400 al 700 con un solo archivo.
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-arimo",
});

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // El servidor pinta el tema por defecto; <ThemeScript> corrige la clase
  // antes del primer paint si el visitante eligió el otro.
  return (
    <html
      lang="es"
      className={`${arimo.variable} ${DEFAULT_THEME}`}
      style={{ colorScheme: DEFAULT_THEME }}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
