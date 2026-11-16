# Landing — catálogo de productos

Sitio público (portada, páginas de producto y de categoría),
separado del CMS. Next.js 15 + Tailwind 4, sin base de datos: el contenido de
ejemplo vive en `src/lib/marketplace/catalog.json`.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Estructura

| Ruta | Archivo |
|---|---|
| `/` | `src/app/(marketplace)/page.tsx` — hero, categorías, catálogo, tendencias, recomendados |
| `/producto/[id]` | `src/app/(marketplace)/producto/[productId]/` — galería + cuadro resumen |
| `/categoria/[slug]` | `src/app/(marketplace)/categoria/[slug]/page.tsx` |
| `/carrito` | `src/app/(marketplace)/carrito/` — productos + resumen |
| `/checkout` | `src/app/(marketplace)/checkout/` — contacto, despacho, envío y pago |
| `/checkout/confirmacion` | `src/app/(marketplace)/checkout/confirmacion/` |

## Contenido

- **Productos, categorías y colecciones:** `src/lib/marketplace/catalog.json`.
- **Imágenes de productos:** `public/products/<id>-<n>.svg` (n = 0 es la portada).
  Se regeneran con `npm run images`; reemplázalas por fotos reales cuando las tengas.
- **Hero:** textos e imágenes en `src/app/(marketplace)/hero-carousel.tsx` y `public/hero/`.
- **Tendencias:** lista `TRENDS` en `src/app/(marketplace)/trends-section.tsx`.

Para conectar una API o un CMS, reimplementa las funciones de
`src/lib/marketplace/data.ts` con las mismas firmas; las páginas no cambian.

## Carrito y checkout

- **Estado del carrito:** `src/lib/cart/store.ts`. Vive en `localStorage` y se
  sincroniza entre pestañas. El panel lateral (`src/components/cart/`) se abre
  desde el ícono del encabezado o al agregar un producto.
- **Envío, pago y totales:** `src/lib/cart/pricing.ts` (costos, despacho
  gratis desde cierto monto, tope de unidades por producto).
- **Crear el pedido:** Server Action `placeOrder` en
  `src/lib/marketplace/orders.ts`. Recalcula los precios desde el catálogo (no
  confía en los del navegador) y, si alguno cambió, devuelve los vigentes para
  refrescar el carro. Hoy no guarda el pedido ni cobra: conectar la base de
  datos y la pasarela de pago en el `TODO` de esa función.

## Diseño

Todos los colores, el radio y la tipografía salen de `tokens.yml`. Ver
[DESIGN.md](DESIGN.md).

```bash
npm run tokens:watch   # en otra terminal: guarda tokens.yml y el sitio se actualiza solo
```
