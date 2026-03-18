import {
  BarChart3,
  Layers,
  LayoutGrid,
  Gauge,
  Layers3,
  RefreshCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";

const serviceIcons: LucideIcon[] = [
  BarChart3,
  Layers,
  LayoutGrid,
  Gauge,
  Layers3,
  RefreshCcw,
];

export interface ServicesSectionProps {
  services: {
    _id: string;
    title: string;
    description: string;
    status: "Draft" | "Published";
  }[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  const publishedServices = services.filter(
    (service) => service.status === "Published"
  );

  return (
    <section
      id="services"
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="services-heading"
    >
      <Container as="div">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="services-heading"
            className="text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl lg:text-4xl"
          >
            We Offer The Best Quality Service for You
          </h2>
          <p className="mt-4 text-gray-600 sm:mt-6 sm:text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. In convallis
            tortor eros. Donec vitae tortor lacus. Phasellus aliquam ante in
            maximus.
          </p>
        </header>

        <ul className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-10 sm:mt-16 sm:gap-x-12 sm:gap-y-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16">
          {publishedServices.map(({ _id, title, description }, index) => {
            const Icon = serviceIcons[index % serviceIcons.length];
            return (
              <li key={_id}>
                <article className="flex flex-col items-start text-left">
                  <div
                    className="flex size-12 shrink-0 items-center justify-center text-blue-600 sm:size-14"
                    aria-hidden
                  >
                    <Icon className="size-6 sm:size-7" strokeWidth={1.5} />
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-[#0f172a] sm:text-xl">
                    {title}
                  </h2>
                  {description && (/<[^>]+>/.test(description) ? (
                    <div
                      className="prose prose-sm prose-gray mt-2 max-w-none sm:mt-3 [&_p]:my-0 [&_p]:text-gray-600"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  ) : (
                    <p className="mt-2 text-gray-600 sm:mt-3">{description}</p>
                  ))}
                </article>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
