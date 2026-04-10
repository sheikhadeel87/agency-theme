import { Container } from "@/components/ui/Container";
import { TestimonialsCarousel } from "@/sections/home/TestimonialsCarousel";
import type { TestimonialsSettingsData, TestimonialItem } from "@/lib/admin-data";

type Props = {
  settings: TestimonialsSettingsData;
  testimonials: TestimonialItem[];
};

export function TestimonialsSection({ settings, testimonials }: Props) {
  return (
    <section
      id="testimonials"
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="testimonials-heading"
    >
      <Container as="div">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="testimonials-heading"
            className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl"
          >
            {settings.sectionTitle || "Client's Testimonials"}
          </h2>
          {settings.sectionDescription ? (
            <p className="mt-4 text-muted-foreground sm:mt-6 sm:text-lg">
              {settings.sectionDescription}
            </p>
          ) : null}
        </header>

        <TestimonialsCarousel testimonials={testimonials} />
      </Container>
    </section>
  );
}
