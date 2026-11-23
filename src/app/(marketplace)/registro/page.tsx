import type { Metadata } from "next";
import { AccountComingSoon } from "@/components/marketplace/account-coming-soon";

// Provisoria: no se indexa hasta que existan las cuentas.
export const metadata: Metadata = { title: "Regístrate", robots: { index: false } };

export default function SignupPage() {
  return <AccountComingSoon mode="signup" />;
}
