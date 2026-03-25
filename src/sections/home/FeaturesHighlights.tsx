import { LifeBuoy, Target, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";

const features = [
  {
    title: "24/7 Support",
    description:
      "Lorem ipsum dolor sit amet conse adipiscing elit.",
    icon: LifeBuoy,
    iconBgClass: "bg-blue-100 text-blue-600",
  },
  {
    title: "Take Ownership",
    description:
      "Lorem ipsum dolor sit amet conse adipiscing elit.",
    icon: Target,
    iconBgClass: "bg-amber-100 text-amber-600",
  },
  {
    title: "Team Work",
    description:
      "Lorem ipsum dolor sit amet conse adipiscing elit.",
    icon: Users,
    iconBgClass: "bg-emerald-100 text-emerald-600",
  },
] as const;

export function FeaturesHighlights() {
  return (
    <section
    id="support"
      className="bg-background py-16 sm:py-20 lg:py-24"
      aria-label="Feature highlights"
    >
      <Container as="div">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-14">
          {features.map(({ title, description, icon: Icon, iconBgClass }) => (
            <article
              key={title}
              className="flex flex-col items-start text-left"
            >
              <div
                className={`flex size-14 shrink-0 items-center justify-center rounded-full sm:size-16 ${iconBgClass}`}
                aria-hidden
              >
                <Icon className="size-7 sm:size-8" strokeWidth={1.5} />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-foreground sm:text-2xl">
                {title}
              </h2>
              <p className="mt-3 text-muted-foreground sm:mt-4 sm:text-lg">
                {description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
