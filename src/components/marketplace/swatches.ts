/**
 * Degradados del marketplace, uno por tono de la paleta `swatch-*` de
 * tokens.yml. Las clases van escritas enteras (no se arman con plantillas)
 * porque Tailwind sólo genera las que encuentra literalmente en el código.
 */
export const SWATCH = {
  1: "from-swatch-1-from to-swatch-1-to",
  2: "from-swatch-2-from to-swatch-2-to",
  3: "from-swatch-3-from to-swatch-3-to",
  4: "from-swatch-4-from to-swatch-4-to",
  5: "from-swatch-5-from to-swatch-5-to",
  6: "from-swatch-6-from to-swatch-6-to",
  7: "from-swatch-7-from to-swatch-7-to",
} as const;

export type SwatchTone = keyof typeof SWATCH;
