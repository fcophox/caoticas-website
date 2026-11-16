import type { Metadata } from "next";
import { CheckoutSteps } from "@/components/cart/checkout-steps";
import { OrderConfirmation } from "./order-confirmation";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false },
};

export default function ConfirmationPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <div className="flex justify-end">
        <CheckoutSteps current={2} />
      </div>
      <OrderConfirmation />
    </div>
  );
}
