import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "No encontrado" };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <SearchX className="size-10 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Aquí no hay nada</h1>
      <p className="mt-2 text-muted-foreground">
        La página que buscas no existe o cambió de dirección.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
