import {
  BarChart3,
  Layers,
  LayoutGrid,
  Gauge,
  Layers3,
  RefreshCcw,
} from "lucide-react";
import { Container } from "@/components/ui/Container";

const services = [
  {
    title: "Crafted for Startups",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In convallis tortor.",
    icon: BarChart3,
  },
  {
    title: "High-quality Design",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In convallis tortor.",
    icon: Layers,
  },
  {
    title: "All Essential Sections",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In convallis tortor.",
    icon: LayoutGrid,
  },
  {
    title: "Speed Optimized",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In convallis tortor.",
    icon: Gauge,
  },
  {
    title: "Fully Customizable",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In convallis tortor.",
    icon: Layers3,
  },
  {
    title: "Regular Updates",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In convallis tortor.",
    icon: RefreshCcw,
  },
] as const;

export function ServicesSection() {
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
          {services.map(({ title, description, icon: Icon }) => (
            <li key={title}>
              <article className="flex flex-col items-start text-left">
                <div
                  className="flex size-12 shrink-0 items-center justify-center text-blue-600 sm:size-14"
                  aria-hidden
                >
                  <Icon className="size-6 sm:size-7" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#0f172a] sm:text-xl">
                  {title}
                </h3>
                <p className="mt-2 text-gray-600 sm:mt-3">
                  {description}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
