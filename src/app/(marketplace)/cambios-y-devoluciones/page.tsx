import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/marketplace/legal-page";
import { APP_NAME, POLICIES } from "@/lib/app-config";

export const metadata: Metadata = {
  title: "Cambios y devoluciones",
  description: `Cómo cambiar o devolver un producto comprado en ${APP_NAME}.`,
};

const sections: LegalSection[] = [
  {
    id: "plazo",
    title: "Plazo",
    body: (
      <p>
        Tienes <strong>{POLICIES.returnDays} días corridos</strong> desde que recibes tu pedido
        para solicitar un cambio o una devolución.
      </p>
    ),
  },
  {
    id: "condiciones",
    title: "Condiciones del producto",
    body: (
      <>
        <p>
          Por higiene y seguridad, en productos de cuidado personal sólo aceptamos cambios o
          devoluciones (salvo fallas) de productos:
        </p>
        <ul>
          <li>Sin abrir y sin uso.</li>
          <li>Con sus sellos de seguridad intactos.</li>
          <li>En su envase original, sin daños.</li>
        </ul>
        <p>
          No aceptamos cambios de productos abiertos o usados, como mascarillas, parches o
          ampollas de un solo uso, salvo que tengan una falla de fabricación.
        </p>
      </>
    ),
  },
  {
    id: "garantia",
    title: "Productos con falla",
    body: (
      <p>
        Si el producto llegó dañado, vencido o con un defecto de fabricación, aplica la garantía
        legal de {POLICIES.legalWarrantyMonths} meses de la Ley N° 19.496: puedes elegir entre el
        cambio del producto o la devolución de lo pagado, y nosotros cubrimos los costos de envío.
        Escríbenos con fotos del producto y del envase.
      </p>
    ),
  },
  {
    id: "como-solicitar",
    title: "Cómo solicitarlo",
    body: (
      <ul>
        <li>Escríbenos por WhatsApp con tu número de pedido y el producto que quieres cambiar o devolver.</li>
        <li>Te indicaremos cómo enviarlo o dónde dejarlo.</li>
        <li>Revisamos el producto al recibirlo y te confirmamos el cambio o la devolución.</li>
      </ul>
    ),
  },
  {
    id: "costos-y-reembolso",
    title: "Costos de envío y reembolso",
    body: (
      <>
        <p>
          Si el cambio o devolución es por una falla, nosotros pagamos el envío. Si es por otro
          motivo (por ejemplo, cambiaste de opinión), el envío de vuelta corre por tu cuenta.
        </p>
        <p>
          Las devoluciones se reembolsan por el mismo medio de pago dentro de los 10 días hábiles
          siguientes a la recepción y revisión del producto. Los plazos de abono en tarjetas
          dependen de cada banco.
        </p>
      </>
    ),
  },
];

export default function ReturnsPage() {
  return (
    <LegalPage
      title="Cambios y devoluciones"
      intro={
        <p>
          Queremos que quedes feliz con tu compra. Si algo no resultó como esperabas, aquí te
          contamos cómo cambiar o devolver un producto. Esta política complementa nuestros{" "}
          <Link href="/terminos" className="text-foreground underline underline-offset-2">
            términos y condiciones
          </Link>
          .
        </p>
      }
      sections={sections}
    />
  );
}
