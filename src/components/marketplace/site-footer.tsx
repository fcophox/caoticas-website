import Link from "next/link";
import { ShieldCheck, Truck } from "lucide-react";
import {
  APP_DESCRIPTION,
  APP_NAME,
  POLICIES,
  SOCIAL,
  formatPhone,
  instagramUrl,
  tiktokUrl,
  whatsappUrl,
} from "@/lib/app-config";
import type { MarketplaceCategory } from "@/lib/marketplace/data";
import { BrandLogo } from "./brand-logo";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "./social-icons";

const HELP_LINKS = [
  { href: "/#como-comprar", label: "Cómo comprar" },
  { href: "/cambios-y-devoluciones", label: "Cambios y devoluciones" },
  { href: "/terminos#despacho", label: "Despachos" },
  { href: "/carrito", label: "Mi carro" },
];

const LEGAL_LINKS = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Política de privacidad" },
  { href: "/cambios-y-devoluciones", label: "Política de cambios" },
];

/** Pie del sitio: marca, redes, enlaces útiles y textos legales. */
export function SiteFooter({ categories }: { categories: MarketplaceCategory[] }) {
  const year = new Date().getFullYear();
  const socials = [
    { href: instagramUrl, label: "Instagram", handle: `@${SOCIAL.instagram}`, Icon: InstagramIcon },
    { href: tiktokUrl, label: "TikTok", handle: `@${SOCIAL.tiktok}`, Icon: TikTokIcon },
    { href: whatsappUrl, label: "WhatsApp", handle: formatPhone(SOCIAL.whatsapp), Icon: WhatsAppIcon },
  ];

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Marca y redes */}
          <div className="col-span-2 max-w-sm md:col-span-1">
            <Link href="/" aria-label={`${APP_NAME}, ir al inicio`} className="inline-flex">
              <BrandLogo className="h-14" />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">{APP_DESCRIPTION}.</p>

            <p className="mt-6 text-sm font-medium">Síguenos y escríbenos</p>
            <ul className="mt-3 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} de ${APP_NAME} (se abre en otra pestaña)`}
                    title={label}
                    className="grid size-10 place-items-center rounded-full border bg-background transition-colors hover:bg-foreground hover:text-background"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              ))}
            </ul>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon className="size-4" />
              Escríbenos por WhatsApp
            </a>
          </div>

          <FooterColumn title="Categorías">
            {categories.map((c) => (
              <FooterLink key={c.slug} href={`/categoria/${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
            <FooterLink href="/#catalogo">Ver todo el catálogo</FooterLink>
          </FooterColumn>

          <FooterColumn title="Ayuda">
            {HELP_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Contacto">
            {socials.map(({ href, label, handle }) => (
              <li key={label} className="text-sm">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="block">{handle}</span>
                </a>
              </li>
            ))}
          </FooterColumn>
        </div>

        {/* Garantías */}
        <ul className="mt-10 grid gap-3 border-t pt-8 text-sm text-muted-foreground sm:grid-cols-2">
          <li className="flex items-center gap-2">
            <Truck className="size-4 shrink-0" />
            Despachos a todo Chile en {POLICIES.dispatchDays}.
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0" />
            {POLICIES.returnDays} días para cambios y devoluciones.
          </li>
        </ul>

        <div className="mt-8 flex flex-col gap-4 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {APP_NAME}. Todos los derechos reservados. Precios en pesos chilenos con IVA
            incluido.
          </p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-foreground hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}
