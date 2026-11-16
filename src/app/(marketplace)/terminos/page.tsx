import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/marketplace/legal-page";
import { APP_NAME, POLICIES } from "@/lib/app-config";
import { SHIPPING_METHODS } from "@/lib/cart/pricing";
import { formatPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: `Condiciones de compra en ${APP_NAME}.`,
};

const sections: LegalSection[] = [
  {
    id: "aceptacion",
    title: "Aceptación",
    body: (
      <p>
        Al navegar en este sitio o hacer un pedido aceptas estos términos. Si no estás de acuerdo,
        te pedimos no usar el sitio. Podemos actualizarlos en cualquier momento; la versión
        vigente es la publicada en esta página al momento de tu compra.
      </p>
    ),
  },
  {
    id: "productos-y-precios",
    title: "Productos, precios y stock",
    body: (
      <>
        <p>
          Los precios están en pesos chilenos e incluyen IVA. El precio que vale es el que ves al
          confirmar tu pedido; si cambia mientras compras, te lo mostraremos antes de confirmar.
        </p>
        <p>
          Las imágenes son referenciales: colores, envases o presentaciones pueden variar
          levemente según el lote del fabricante. Todos los productos están sujetos a
          disponibilidad de stock. Si después de tu compra un producto no está disponible, te
          contactaremos para ofrecerte un cambio o la devolución total de lo pagado.
        </p>
        <p>
          Las ofertas y descuentos valen mientras se indiquen en el sitio o hasta agotar stock, y
          no son acumulables salvo que se diga lo contrario.
        </p>
      </>
    ),
  },
  {
    id: "compra",
    title: "Cómo se realiza la compra",
    body: (
      <>
        <p>
          Eliges tus productos, los agregas al carro e ingresas tus datos de contacto y despacho.
          Al confirmar recibirás un número de pedido y un correo con el detalle. El contrato se
          entiende perfeccionado una vez confirmado el pago.
        </p>
        <p>
          Eres responsable de que los datos que ingresas sean correctos. Si la dirección está
          incompleta o es errónea, el despacho puede atrasarse o tener costos adicionales.
        </p>
      </>
    ),
  },
  {
    id: "pago",
    title: "Medios de pago",
    body: (
      <ul>
        <li>
          <strong>Tarjeta de crédito o débito</strong>, a través de una pasarela de pago externa.
          Nunca solicitamos ni guardamos los datos de tu tarjeta en este sitio.
        </li>
        <li>
          <strong>Transferencia bancaria</strong>: te enviamos los datos por correo y reservamos
          tu pedido por 48 horas. Si no recibimos el pago en ese plazo, el pedido se anula.
        </li>
      </ul>
    ),
  },
  {
    id: "despacho",
    title: "Despacho",
    body: (
      <>
        <p>Despachamos a todo Chile. Las opciones y costos son:</p>
        <ul>
          {SHIPPING_METHODS.map((m) => (
            <li key={m.id}>
              <strong>{m.label}</strong>: {formatPrice(m.price)}
              {m.freeFrom !== null && <> (gratis en compras desde {formatPrice(m.freeFrom)})</>}. {m.description}
            </li>
          ))}
        </ul>
        <p>
          Los plazos se cuentan en días hábiles desde la confirmación del pago y son estimados:
          pueden extenderse en zonas extremas, feriados o por causas ajenas a nosotros. Te
          avisaremos cuando tu pedido vaya en camino.
        </p>
        <p>
          Al recibir, revisa que el paquete esté en buen estado. Si llega dañado o incompleto,
          escríbenos dentro de las 48 horas siguientes con fotos del paquete y su contenido.
        </p>
      </>
    ),
  },
  {
    id: "retracto-y-garantia",
    title: "Retracto, cambios y garantía",
    body: (
      <>
        <p>
          Tienes <strong>{POLICIES.returnDays} días</strong> desde que recibes tu pedido para
          solicitar un cambio o devolución. Por tratarse de productos de cuidado personal, deben
          estar sin abrir, sin uso y con sus sellos y envase original.
        </p>
        <p>
          Si un producto tiene una falla o defecto de fabricación, aplica la{" "}
          <strong>garantía legal de {POLICIES.legalWarrantyMonths} meses</strong> de la Ley N°
          19.496 sobre Protección de los Derechos de los Consumidores: puedes elegir entre cambio,
          reparación o devolución del dinero.
        </p>
        <p>
          El detalle del procedimiento está en nuestra{" "}
          <Link href="/cambios-y-devoluciones">política de cambios y devoluciones</Link>.
        </p>
      </>
    ),
  },
  {
    id: "uso-de-productos",
    title: "Uso de los productos",
    body: (
      <p>
        Los productos son cosméticos de uso externo. Lee las instrucciones y advertencias del
        envase antes de usarlos. Si tienes piel sensible o alergias, prueba primero en una zona
        pequeña y suspende el uso si notas irritación. La información del sitio es referencial y
        no reemplaza la indicación de un profesional de la salud.
      </p>
    ),
  },
  {
    id: "propiedad-intelectual",
    title: "Propiedad intelectual",
    body: (
      <p>
        Los textos, imágenes, logotipos y diseño de este sitio son de {APP_NAME} o de sus
        respectivos titulares, como las marcas de los productos que vendemos. No pueden usarse sin
        autorización.
      </p>
    ),
  },
  {
    id: "datos-personales",
    title: "Datos personales",
    body: (
      <p>
        Usamos tus datos sólo para gestionar tu compra y responder tus consultas. Más detalles en
        nuestra <Link href="/privacidad">política de privacidad</Link>.
      </p>
    ),
  },
  {
    id: "contacto-y-ley",
    title: "Contacto y legislación aplicable",
    body: (
      <>
        <p>
          Para cualquier consulta o reclamo escríbenos por WhatsApp o redes sociales; los enlaces
          están al pie de esta página. Responderemos a la brevedad.
        </p>
        <p>
          Estos términos se rigen por las leyes de la República de Chile, en especial la Ley N°
          19.496. Si no quedas conforme con nuestra respuesta, puedes acudir al Servicio Nacional
          del Consumidor (SERNAC) o a los tribunales competentes.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      intro={
        <p>
          Estas condiciones regulan el uso de este sitio y las compras que hagas en {APP_NAME}.
          Léelas con calma: al comprar declaras conocerlas y aceptarlas.
        </p>
      }
      sections={sections}
    />
  );
}
