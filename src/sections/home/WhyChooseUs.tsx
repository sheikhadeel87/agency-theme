import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Container } from "@/components/ui/Container";

const images = [
  { src: "/images/why-choose-1.png", alt: "Team member working on laptop" },
  { src: "/images/why-choose-2.png", alt: "Colleagues reviewing content together" },
  { src: "/images/why-choose-3.png", alt: "Collaboration at work" },
] as const;

// Reference order: top-left = 2 (MacBook), bottom-left = 1 (solo), right = 3 (tall)
const TOP_LEFT = 1;
const BOTTOM_LEFT = 0;
const RIGHT = 2;

export function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="bg-[#f5f5f5] py-16 sm:py-20 lg:py-24"
      aria-labelledby="why-choose-us-heading"
    >
      <Container as="div">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Left: image collage — left column aligned with gap; right image full height */}
          <div className="relative order-2 aspect-[1.02] w-full max-w-[520px] lg:order-1 lg:max-w-none">
            {/* Top-left image — slightly taller than bottom */}
            <div
              className="absolute left-0 top-0 z-10 w-[38%] overflow-hidden rounded-2xl sm:rounded-3xl"
              style={{ aspectRatio: "4/5" }}
            >
              <Image
                src={images[TOP_LEFT].src}
                alt={images[TOP_LEFT].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 38vw, 200px"
              />
            </div>
            {/* Bottom-left image — same left edge as top-left, significant vertical gap above */}
            <div
              className="absolute bottom-0 left-0 z-10 w-[38%] overflow-hidden rounded-2xl sm:rounded-3xl"
              style={{ aspectRatio: "4/4.5", top: "56%" }}
            >
              <Image
                src={images[BOTTOM_LEFT].src}
                alt={images[BOTTOM_LEFT].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 38vw, 200px"
              />
            </div>
            {/* Right image — top aligns with top-left, bottom with bottom-left, slightly wider */}
            <div className="absolute right-0 top-0 z-10 h-full w-[52%] overflow-hidden rounded-2xl sm:rounded-3xl">
              <Image
                src={images[RIGHT].src}
                alt={images[RIGHT].alt}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 52vw, 300px"
              />
            </div>
          </div>

          {/* Right: content */}
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Why Choose Us
            </p>
            <h2
              id="why-choose-us-heading"
              className="mt-4 text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl lg:text-4xl"
            >
              We Make Our customers happy by giving Best services.
            </h2>
            <p className="mt-6 text-gray-600 sm:mt-8 sm:text-lg">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout. The
              point of using Lorem Ipsum.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
              <Link
                href="/#how-we-work"
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:size-16"
                aria-label="Play: See how we work"
              >
                <Play className="ml-1 size-6 fill-current sm:size-7" />
              </Link>
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-900 sm:text-base">
                See How We Work
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
