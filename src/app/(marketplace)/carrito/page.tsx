import type { Metadata } from "next";
import { CheckoutSteps } from "@/components/cart/checkout-steps";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Tu carro",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Tu carro</h1>
        <CheckoutSteps current={0} />
      </div>
      <CartView />
    </div>
  );
}
