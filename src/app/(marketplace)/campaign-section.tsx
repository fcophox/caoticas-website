"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { ShopCard } from "@/components/marketplace/shop-card";
import type { PublicCampaign } from "@/lib/marketplace/data";
import { cn } from "@/lib/utils";

/**
 * Campaña especial del home: título a la izquierda, subfiltros a la derecha y
 * debajo los cuatro productos del subfiltro activo. Los textos y subfiltros
 * se configuran en `src/lib/marketplace/campaign.ts`.
 */
export function CampaignSection({ campaign }: { campaign: PublicCampaign }) {
  const [active, setActive] = useState(campaign.filters[0].category);
  const current = campaign.filters.find((f) => f.category === active) ?? campaign.filters[0];

  return (
    <section aria-labelledby="campana" className="border-t py-12 md:py-16">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-primary">
            <Gift className="size-4" />
            {campaign.eyebrow}
          </p>
          <h2 id="campana" className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            {campaign.title}
          </h2>
          <p className="mt-2 text-muted-foreground">{campaign.description}</p>
        </div>

        <div
          role="tablist"
          aria-label={`Filtrar ${campaign.title}`}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:shrink-0 md:px-0 md:pb-0"
        >
          {campaign.filters.map((f) => {
            const isActive = f.category === current.category;
            return (
              <button
                key={f.category}
                type="button"
                role="tab"
                id={`campana-tab-${f.category}`}
                aria-selected={isActive}
                aria-controls="campana-panel"
                onClick={() => setActive(f.category)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                  isActive
                    ? "border-primary bg-primary font-semibold text-primary-foreground"
                    : "text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <ul
        id="campana-panel"
        role="tabpanel"
        aria-labelledby={`campana-tab-${current.category}`}
        className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4"
      >
        {current.products.map((p) => (
          <li key={p.id}>
            <ShopCard product={p} sizes="(min-width: 1024px) 25vw, 50vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
