import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketplace/legal-page";
import { APP_NAME } from "@/lib/app-config";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Cómo ${APP_NAME} usa y protege tus datos personales.`,
};

const sections: LegalSection[] = [
  {
    id: "datos",
    title: "Qué datos recopilamos",
    body: (
      <>
        <p>Sólo los necesarios para atender tu compra:</p>
        <ul>
          <li>Nombre, correo electrónico y teléfono.</li>
          <li>Dirección de despacho e indicaciones de entrega.</li>
          <li>El detalle de tus pedidos.</li>
        </ul>
        <p>
          No recibimos ni guardamos los datos de tu tarjeta: el pago se procesa en una pasarela
          externa.
        </p>
      </>
    ),
  },
  {
    id: "uso",
    title: "Para qué los usamos",
    body: (
      <ul>
        <li>Procesar, despachar y hacer seguimiento de tus pedidos.</li>
        <li>Contactarte por temas relacionados con tu compra, cambios o devoluciones.</li>
        <li>Responder tus consultas por WhatsApp o redes sociales.</li>
        <li>Cumplir obligaciones legales, tributarias y contables.</li>
      </ul>
    ),
  },
  {
    id: "terceros",
    title: "Con quién los compartimos",
    body: (
      <p>
        Sólo con quienes nos ayudan a completar tu compra, como la empresa de despacho y la
        pasarela de pago, y únicamente con los datos que necesitan. No vendemos ni arrendamos tus
        datos a terceros.
      </p>
    ),
  },
  {
    id: "navegador",
    title: "Datos guardados en tu navegador",
    body: (
      <p>
        Tu carro de compras se guarda en el almacenamiento local de tu navegador para que no se
        pierda al recargar la página. No lo usamos para identificarte y puedes borrarlo vaciando
        el carro o los datos del sitio en tu navegador.
      </p>
    ),
  },
  {
    id: "derechos",
    title: "Tus derechos",
    body: (
      <p>
        Puedes pedirnos en cualquier momento acceder a tus datos, corregirlos, eliminarlos u
        oponerte a su uso, conforme a la legislación chilena de protección de datos personales.
        Escríbenos por WhatsApp y te responderemos a la brevedad.
      </p>
    ),
  },
  {
    id: "seguridad",
    title: "Seguridad y conservación",
    body: (
      <p>
        Protegemos tus datos con medidas razonables de seguridad y los conservamos sólo mientras
        sean necesarios para los fines descritos o lo exija la ley.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      intro={
        <p>
          En {APP_NAME} cuidamos tus datos personales. Esta política explica qué información
          recopilamos, para qué la usamos y cuáles son tus derechos.
        </p>
      }
      sections={sections}
    />
  );
}
