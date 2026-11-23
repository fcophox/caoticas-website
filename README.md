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
| `/` | `src/app/(marketplace)/page.tsx` — hero, categorías, campaña especial, tendencias, recomendados |
| `/catalogo` | `src/app/(marketplace)/catalogo/` — filtros a la izquierda (búsqueda, categorías, precio, ofertas) y grilla de 4 columnas. Los filtros viven en la URL: `?q=`, `?categoria=`, `?precio=`, `?ofertas=1` |
| `/producto/[id]` | `src/app/(marketplace)/producto/[productId]/` — galería + cuadro resumen |
| `/carrito` | `src/app/(marketplace)/carrito/` — productos + resumen |
| `/checkout` | `src/app/(marketplace)/checkout/` — contacto, despacho, envío y pago |
| `/checkout/confirmacion` | `src/app/(marketplace)/checkout/confirmacion/` |

`/categoria/[slug]` y `/buscar` redirigen a `/catalogo` con el filtro equivalente
(`next.config.ts`), para que los enlaces viejos sigan funcionando.

## Contenido

- **Productos, categorías y colecciones:** `src/lib/marketplace/catalog.json`.
- **Imágenes de productos:** `public/products/<id>-<n>.svg` (n = 0 es la portada).
  Se regeneran con `npm run images`; reemplázalas por fotos reales cuando las tengas.
- **Hero:** textos e imágenes en `src/app/(marketplace)/hero-carousel.tsx` y `public/hero/`.
- **Tendencias:** lista `TRENDS` en `src/app/(marketplace)/trends-section.tsx`.
- **Campaña especial del home** (hoy "Sets de Navidad"): textos, colección y subfiltros
  (máximo 4, uno por categoría) en `src/lib/marketplace/campaign.ts`. Los productos son
  los de esa colección en el CMS.

### Supabase (CMS)

Si existe `.env.local` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (ver
[`.env.example`](.env.example)), el sitio lee productos, categorías y
colecciones desde el Supabase del CMS, en vivo: lo que cambies en el CMS se ve
al recargar. Sólo se publican los productos activos del espacio
`SUPABASE_TENANT_SLUG` (por defecto `demo`). Código en
`src/lib/marketplace/supabase-source.ts`.

Sin esas variables (como en Vercel hoy) se usa `catalog.json`. Mientras el
Supabase sea local, **cada cambio de productos hay que reflejarlo también en
`catalog.json`** para que llegue al sitio publicado. Al pasar a un Supabase en
la nube basta con poner las mismas variables en Vercel.

Las imágenes son marcadores (`public/products/<slug-del-nombre>-0.svg`); las
fotos del CMS todavía no se leen.

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
