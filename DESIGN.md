# DESIGN — Sistema de diseño de la landing

> Fuente de verdad del diseño visual del sitio.
> Los valores editables viven en [`tokens.yml`](tokens.yml).

## Cómo funciona

`tokens.yml` es la fuente de verdad. El generador lo lee y escribe dos
archivos, que **no** se editan a mano:

| Generado | Para qué |
|----------|----------|
| [`src/styles/tokens.generated.css`](src/styles/tokens.generated.css) | Variables CSS (`:root` = oscuro, `.light`, `@theme`), importadas por `globals.css` |
| [`src/lib/tokens.generated.ts`](src/lib/tokens.generated.ts) | Los mismos valores para TypeScript (`DARK_TOKENS`, `LIGHT_TOKENS`, `BRAND_TOKENS`) |

```bash
npm run tokens
```

```bash
npm run tokens:watch
```

`npm run dev` y `npm run build` ejecutan el generador antes de arrancar, así
que un `tokens.yml` recién editado nunca queda desincronizado. Los archivos
generados **se commitean**: el build no necesita nada extra.

### La cadena completa

```
tokens.yml
   ├─→ tokens.generated.css ─→ globals.css ─→ @theme inline ─→ utilidades Tailwind
   │        (:root / .light)                                    (bg-background, text-muted-foreground…)
   └─→ tokens.generated.ts  ─→ BRAND_TOKENS, DEFAULT_THEME (para TypeScript)
```

Cambiar `colors.background.dark` en el YAML repinta el sitio entero: no hay un
solo hex hardcodeado en `globals.css` ni en los componentes.

---

## Temas: claro por defecto, oscuro opcional

El sitio es **claro por defecto** (`DEFAULT_THEME` en
[`scripts/generate-tokens.mjs`](scripts/generate-tokens.mjs)) y el conmutador
está oculto (`THEME_TOGGLE_ENABLED` en [`app-config.ts`](src/lib/app-config.ts)).
El CSS conserva los dos temas, así que reactivar el oscuro es cambiar esas
dos constantes. Un sufijo `.dark` / `.light` en `tokens.yml`
reparte el valor entre los dos temas; sin sufijo aplica a ambos.

| Selector | Contiene |
|---|---|
| `:root` | Tokens compartidos + **todos los valores oscuros** |
| `.light` | Sólo los overrides del tema claro |
| `.dark` | Los mismos valores oscuros, para anidar un bloque oscuro dentro de una página clara |

Los valores oscuros viven en `:root` por herencia del diseño original; el tema
real lo decide la clase que el servidor pinta en `<html>` (`DEFAULT_THEME`).

**Cómo se aplica.** `<html>` se renderiza en el servidor con la clase del tema
por defecto ([`layout.tsx`](src/app/layout.tsx)). Antes del primer paint,
[`<ThemeScript>`](src/components/theme-script.tsx) —un script inline y
bloqueante— lee `localStorage["kntr-theme"]` y corrige la clase si el usuario
eligió el otro tema. Sin ese script habría un flash de tema equivocado en cada
carga para los usuarios de tema claro.

Las dos clases son excluyentes: `.dark` la necesitan las variantes `dark:` de
Tailwind, `.light` activa el bloque de overrides. Ambas las gestiona
`applyTheme()` en [`src/lib/theme/mode.ts`](src/lib/theme/mode.ts).

El conmutador [`<ThemeToggle />`](src/components/theme-toggle.tsx) está en el
encabezado del sitio.

---

## Tokens base — Chrome de la aplicación

Colores del sitio: superficies, texto y bordes. El nombre CSS se deriva del grupo en `tokens.yml`:

| Grupo | Prefijo CSS | Ejemplo |
|---|---|---|
| Colores | `--<nombre>` | `--background`, `--muted-foreground` |
| Tipografía | `--font-*-stack` | `--font-sans-stack` |
| Espaciado | `--spacing-*` | `--spacing-md` |
| Radio base | `--radius` | `--radius` (sm/md/lg/xl se derivan en `globals.css`) |
| Sombras | `--shadow-*` | `--shadow-md` |
| Animaciones | `--anim-*` | `--anim-normal` |
| Breakpoints | `--breakpoint-*` | `--breakpoint-lg` |

> **Los breakpoints son especiales.** Acaban en media queries, y una media
> query no puede leer `var()`. El generador los emite como valores literales
> dentro de `@theme`, no en `:root`, que es lo que permite que `lg:` en
> Tailwind responda a lo que dice el YAML.

`--font-sans-stack` referencia `--font-sansation`, que inyecta `next/font` en el
layout raíz. Si cambias esa variable en `layout.tsx`, cámbiala también en
`fonts.sans`.

### Estados semánticos

`warn`, `success` y `danger` (más su `-surface`) existen para los callouts del
los badges de estado. Cada uno tiene un color de acento y una
superficie de fondo por tema. `destructive` es el rojo de acciones peligrosas
del design system de Shadcn y es distinto de `danger`, que es contenido.

### Tokens para contenido sobre imágenes

El marketplace pone texto y botones **sobre imágenes y degradados**, donde
`foreground`/`background` no sirven (cambian con el tema y la foto no). Para eso
existen tokens que valen igual en ambos temas:

| Token | Utilidad | Uso |
|---|---|---|
| `on-media` | `text-on-media`, `bg-on-media` | Texto, íconos y botón claro sobre imágenes (hero, tendencias) |
| `overlay` | `bg-overlay/60`, `from-overlay/70` | Velo del hero y pestaña negra de las tendencias |
| `swatch-1…7-from` / `-to` | `from-swatch-N-from to-swatch-N-to` | Paleta de degradados: círculos de categorías y tarjetas de tendencias |

Los degradados se usan siempre a través de `SWATCH[n]` en
[`src/components/marketplace/swatches.ts`](src/components/marketplace/swatches.ts):
Tailwind sólo genera las clases que encuentra escritas enteras en el código.

---

## Ver y cambiar los tokens

Con el sitio corriendo (`npm run dev`), abre otra terminal:

```bash
npm run tokens:watch
```

Cada vez que guardas `tokens.yml` se regeneran las variables y el navegador se
actualiza solo, sin recargar. Los valores generados quedan en
`src/styles/tokens.generated.css` (variables CSS) y `src/lib/tokens.generated.ts`
(los mismos valores en TypeScript).

---

## Brand

El bloque `brand` de `tokens.yml` se expone como `--brand-primary`,
`--brand-secondary` y `--brand-radius`: el color **exacto** de la marca, para
logos o detalles que no deben ajustarse por contraste. El generador exige que
el bloque exista.

---

## Reglas de uso

1. **Ningún hex en componentes.** Usa las utilidades de Tailwind
   (`bg-card`, `text-muted-foreground`, `border-border`) o `var(--token)`.
   Si necesitas un color que no existe, añádelo a `tokens.yml`.
2. **Ninguna clase de color de Tailwind por defecto** (`bg-zinc-800`,
   `text-amber-500`): no reaccionan al tema ni a los tokens.
3. **Nunca edites los `.generated.*`.** El siguiente `npm run dev` los pisa.
4. **Un token nuevo con variante por tema necesita las dos**, `.light` y
   `.dark`. El generador no inventa el que falte.
5. **Colores nuevos de UI: cablearlos en `@theme inline`** de
   [`globals.css`](src/styles/globals.css) como `--color-<nombre>` si quieres
   la utilidad de Tailwind (`bg-<nombre>`).

### Añadir un token, de principio a fin

```yaml
# tokens.yml
base:
  colors.info.dark: "#38bdf8"
  colors.info.light: "#0284c7"
```

```css
/* src/styles/globals.css — dentro de @theme inline */
--color-info: var(--info);
```

```bash
npm run tokens
```

Ya puedes usar `bg-info` / `text-info` en cualquier componente, y responde al
tema solo.

---

## Resumen de contextos

| Contexto | Tokens principales | Notas |
|---|---|---|
| **Superficies** | `background`, `foreground`, `card`, `muted`, `border` | Core del tema, claro por defecto |
| **Acentos** | `primary`, `secondary`, `accent`, `ring`, `radius` | Botones, etiquetas de descuento, foco |
| **Estados** | `destructive`, `warn`, `success`, `danger` (+ `-surface`) | Badges y callouts |
| **Identidad exacta** | `brand-primary`, `brand-secondary` | El hex de la marca sin ajuste de contraste |
| **Sobre imágenes** | `on-media`, `overlay`, `swatch-*` | Iguales en ambos temas |
| **Escalas** | `spacing-*`, `radius-*`, `shadow-*`, `anim-*`, `breakpoint-*` | Compartidas salvo las sombras, que sí varían por tema |
