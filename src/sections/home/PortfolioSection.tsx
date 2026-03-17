import Image from "next/image";
import { Container } from "@/components/ui/Container";

const FILTERS = [
  "All",
  "Branding Strategy",
  "Digital Experiences",
  "Ecommerce",
] as const;

/* Aspect ratios: small 437×320, tall 437×687, wide 912×330 */
const galleryItems = [
  {
    src: "/images/portfolio-1.png",
    alt: "Portfolio project 1",
    gridClass: "lg:col-start-1 lg:row-start-1",
    aspectClass: "aspect-[437/320]",
  },
  {
    src: "/images/portfolio-2.png",
    alt: "Portfolio project 2",
    gridClass: "lg:col-start-2 lg:row-start-1",
    aspectClass: "aspect-[437/320]",
  },
  {
    src: "/images/portfolio-3.png",
    alt: "Portfolio project 3",
    gridClass: "lg:col-start-3 lg:row-span-2 lg:row-start-1",
    aspectClass: "aspect-[437/687] lg:aspect-auto lg:h-full lg:min-h-0",
  },
  {
    src: "/images/portfolio-4.png",
    alt: "Portfolio project 4",
    gridClass: "lg:col-span-2 lg:col-start-1 lg:row-start-2",
    aspectClass: "aspect-[912/330]",
  },
] as const;

export function PortfolioSection() {
  return (
    <section
      id="portfolio"
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="portfolio-heading"
    >
      <Container as="div">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="portfolio-heading"
            className="text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl lg:text-4xl"
          >
            Our Recent Works & Case Studies
          </h2>
          <p className="mt-5 text-gray-600 sm:mt-6 sm:text-lg">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using.
          </p>

          {/* Filter pills — centered, All active (blue), others soft gray */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12">
            {FILTERS.map((label) => (
              <button
                key={label}
                type="button"
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                  label === "All"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* Asymmetric gallery — breathing room, rounded cards with subtle pop */}
        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 sm:mt-16 sm:gap-5 lg:grid-cols-3 lg:grid-rows-2 lg:gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.src}
              className={`relative overflow-hidden bg-gray-50 shadow-sm  ${item.gridClass} ${item.aspectClass}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
