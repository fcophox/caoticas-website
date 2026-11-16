/**
 * Identidad del sitio. Cambiar estos valores repinta el título del navegador,
 * el encabezado y el pie de página.
 */
export const APP_NAME = "Caóticas";

export const APP_DESCRIPTION = "Productos de cuidado personal con despacho a todo Chile";

/**
 * Redes y contacto del pie de página.
 *
 * TODO: reemplazar por las cuentas y el número reales. `whatsapp` va sólo con
 * dígitos y código de país (56 + 9 + número), como lo pide wa.me.
 */
export const SOCIAL = {
  tiktok: "caoticas.cl",
  instagram: "caoticas.cl",
  whatsapp: "56900000000",
  /** Mensaje con el que se abre el chat de WhatsApp. */
  whatsappMessage: "Hola, vengo del sitio web y tengo una consulta.",
} as const;

export const tiktokUrl = `https://www.tiktok.com/@${SOCIAL.tiktok}`;
export const instagramUrl = `https://www.instagram.com/${SOCIAL.instagram}/`;
export const whatsappUrl = `https://wa.me/${SOCIAL.whatsapp}?text=${encodeURIComponent(SOCIAL.whatsappMessage)}`;

/** "56912345678" → "+56 9 1234 5678". */
export function formatPhone(digits: string): string {
  const m = digits.match(/^56(9)(\d{4})(\d{4})$/);
  return m ? `+56 ${m[1]} ${m[2]} ${m[3]}` : `+${digits}`;
}

/** Condiciones comerciales que se repiten en el sitio y en los textos legales. */
export const POLICIES = {
  returnDays: 30,
  /** Garantía legal de la Ley del Consumidor (art. 21 Ley 19.496). */
  legalWarrantyMonths: 6,
  dispatchDays: "2 a 5 días hábiles",
  /** Fecha de la última actualización de los textos legales. */
  legalUpdatedAt: "16 de noviembre de 2026",
} as const;

/**
 * Muestra el botón para alternar entre tema claro y oscuro. Apagado, el sitio
 * se ve siempre en el tema por defecto (`DEFAULT_THEME`, hoy claro) e ignora
 * cualquier elección guardada antes.
 */
export const THEME_TOGGLE_ENABLED = false;
