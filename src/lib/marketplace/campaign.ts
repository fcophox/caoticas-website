/**
 * Campaña especial del home (debajo de "Revisa nuestras categorías").
 *
 * Muestra los productos de una colección del CMS, separados en subfiltros por
 * categoría. Para cambiar de campaña, crea la colección en el CMS, asígnale
 * productos y cambia `collection`, los textos y los subfiltros aquí.
 * La colección de la campaña no aparece como pestaña en "Nuestros recomendados".
 */
export const CAMPAIGN = {
  collection: "sets-de-navidad",
  eyebrow: "Campaña especial",
  title: "Sets de Navidad",
  description: "Regalos listos para envolver, a precio especial por temporada.",
  /** Máximo 4. Un subfiltro sin productos no se muestra. */
  filters: [
    { label: "Cabello", category: "cuidado-capilar" },
    { label: "Rostro", category: "cuidado-facial" },
    { label: "Cuerpo", category: "cuidado-corporal" },
    { label: "Labios", category: "labios" },
  ],
} as const;

/** Productos visibles por subfiltro: una fila de cuatro en escritorio. */
export const CAMPAIGN_PRODUCTS_PER_FILTER = 4;
