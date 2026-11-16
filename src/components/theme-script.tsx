import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme/mode";
import { THEME_TOGGLE_ENABLED } from "@/lib/app-config";

/**
 * Script bloqueante en <head>. El servidor pinta siempre el tema por defecto
 * (`DEFAULT_THEME`); esto corrige la clase ANTES del primer paint para quien haya
 * elegido el otro, que es lo que evita el flash de tema equivocado.
 *
 * Con el conmutador oculto (`THEME_TOGGLE_ENABLED = false`) no hay elección
 * que respetar: no se emite nada y vale el tema por defecto.
 *
 * Va inline y sin dependencias a propósito: cualquier import lo convertiría
 * en un chunk asíncrono y volvería el flash.
 */
export function ThemeScript() {
  if (!THEME_TOGGLE_ENABLED) return null;
  const js = `(function(){try{
var m=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
if(m!=="dark"&&m!=="light")m=${JSON.stringify(DEFAULT_THEME)};
var r=document.documentElement;
r.classList.toggle("dark",m==="dark");
r.classList.toggle("light",m==="light");
r.style.colorScheme=m;
}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
