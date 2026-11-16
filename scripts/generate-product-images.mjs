#!/usr/bin/env node
/**
 * Genera las imágenes de ejemplo de los productos (SVG) a partir de
 * src/lib/marketplace/catalog.json:
 *
 *   public/products/<id>-0.svg   portada
 *   public/products/<id>-1..3.svg vistas adicionales de la galería
 *
 *   npm run images
 *
 * Son marcadores de posición. Para usar fotos reales, reemplaza los archivos
 * (o cambia las rutas en src/lib/marketplace/data.ts).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync("src/lib/marketplace/catalog.json", "utf8"));
const categoryName = Object.fromEntries(catalog.categories.map((c) => [c.slug, c.name]));

// Colores de los marcadores, por nombre de categoría.
const PALETTES = {
  "Cuidado capilar": ["#b48ae6", "#d96ec4"],
  "Cuidado facial": ["#e07cbf", "#f0a07a"],
  "Cuidado corporal": ["#a77be0", "#6a35a8"],
  Labios: ["#1c1323", "#8a3d93"],
  Ropa: ["#6366f1", "#a855f7"],
  Accesorios: ["#f59e0b", "#ef4444"],
  Hogar: ["#10b981", "#0ea5e9"],
  Papelería: ["#ec4899", "#f97316"],
  Despensa: ["#84cc16", "#ca8a04"],
  Tecnología: ["#0f172a", "#3b82f6"],
  Deporte: ["#06b6d4", "#22c55e"],
};

const escapeXml = (s) =>
  s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]);

/** Parte el nombre en hasta 3 líneas de ~14 caracteres para que quepa grande. */
function wrap(text, max = 14) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

const VIEWS = ["", "Vista frontal", "Detalle", "En uso"];

function productSvg(name, category, index, view = 0) {
  const palette = PALETTES[category] ?? ["#64748b", "#334155"];
  // Cada vista invierte o gira el degradado para que la galería no sea idéntica.
  const [from, to] = view % 2 ? [palette[1], palette[0]] : palette;
  const lines = wrap(name);
  const startY = 400 - ((lines.length - 1) * 70) / 2;
  const tspans = lines
    .map((l, i) => `<tspan x="400" y="${startY + i * 70}">${escapeXml(l)}</tspan>`)
    .join("");
  // Círculos decorativos con posición derivada del índice: cada imagen distinta.
  const cx = 120 + (((index + view * 3) * 97) % 560);
  const cy = 120 + (((index + view * 5) * 53) % 560);
  const viewLabel = VIEWS[view]
    ? `<text x="400" y="720" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#fff" opacity="0.7">${VIEWS[view]}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
  </linearGradient></defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <circle cx="${cx}" cy="${cy}" r="220" fill="#fff" opacity="0.08"/>
  <circle cx="${800 - cx}" cy="${800 - cy}" r="140" fill="#fff" opacity="0.06"/>
  <text x="400" y="110" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="32" letter-spacing="6" fill="#fff" opacity="0.75">${escapeXml(category.toUpperCase())}</text>
  <text text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="64" fill="#fff">${tspans}</text>
  ${viewLabel}
</svg>`;
}

mkdirSync("public/products", { recursive: true });
let files = 0;
catalog.products.forEach((p, i) => {
  const category = categoryName[p.category] ?? "Otros";
  for (let view = 0; view < p.images; view++) {
    writeFileSync(`public/products/${p.id}-${view}.svg`, productSvg(p.name, category, i, view));
    files++;
  }
});
console.log(`✓ ${files} imágenes en public/products/`);
