import type { FeaturesHighlightsSettingsData } from "@/lib/admin-data";
import type {
  FeatureHighlightCard,
  FeatureHighlightIconKey,
  FeatureHighlightVariant,
} from "@/lib/features-highlights-defaults";
import { Container } from "@/components/ui/Container";
import { LifeBuoy, Shield, Sparkles, Target, Users, type LucideIcon } from "lucide-react";

const ICON_MAP: Record<FeatureHighlightIconKey, LucideIcon> = {
  lifebuoy: LifeBuoy,
  target: Target,
  users: Users,
  sparkles: Sparkles,
  shield: Shield,
};

const VARIANT_CLASS: Record<FeatureHighlightVariant, string> = {
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
};

type Props = {
  settings: FeaturesHighlightsSettingsData;
};

export function FeaturesHighlights({ settings }: Props) {
  const items: FeatureHighlightCard[] = settings.items;

  return (
    <section
      id="support"
      className="bg-background py-16 sm:py-20 lg:py-24"
      aria-label="Support"
    >
      <Container as="div">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-14">
          {items.map((card, index) => {
            const Icon = ICON_MAP[card.iconKey] ?? LifeBuoy;
            const tone = VARIANT_CLASS[card.variant] ?? VARIANT_CLASS.blue;
            return (
              <article
                key={`${index}-${card.title}`}
                className="flex flex-col items-start text-left"
              >
                <div
                  className={`flex size-14 shrink-0 items-center justify-center rounded-full sm:size-16 ${tone}`}
                  aria-hidden
                >
                  <Icon className="size-7 sm:size-8" strokeWidth={1.5} />
                </div>
                <h2 className="mt-6 text-xl font-semibold text-foreground sm:text-2xl">
                  {card.title}
                </h2>
                <p className="mt-3 text-muted-foreground sm:mt-4 sm:text-lg">{card.description}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
