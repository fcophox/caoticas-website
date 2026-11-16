/** Formato de precios del catálogo (pesos chilenos, sin decimales). */

const currency = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return currency.format(value);
}
