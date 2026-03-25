import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { HeroData } from "@/lib/admin-data";

const DEFAULTS = {
  heading: "We specialize in UI/UX, Web Development, Digital Marketing.",
  description:
    "We help brands grow with strategy, design, and technology. From concept to launch, we deliver solutions that drive results.",
  ctaText: "Get Started Now",
  ctaLink: "/#get-started",
  phoneText: "Call us (0123) 456 – 789",
  badgeText: "For any question or concern",
};

export type HeroProps = {
  heroData?: HeroData | null;
};

export function Hero({ heroData }: HeroProps) {
  const heading = heroData?.heading?.trim() || DEFAULTS.heading;
  const description = heroData?.description?.trim() || DEFAULTS.description;
  const ctaText = heroData?.ctaText?.trim() || DEFAULTS.ctaText;
  const ctaLink = heroData?.ctaLink?.trim() || DEFAULTS.ctaLink;
  const phoneText = heroData?.phoneText?.trim() || DEFAULTS.phoneText;
  const badgeText = heroData?.badgeText?.trim() || DEFAULTS.badgeText;
  const showPhoneBlock = phoneText || badgeText;

  return (
    <section
      className="flex flex-1 flex-col bg-muted py-16 sm:py-20 lg:py-28"
      aria-labelledby="hero-heading"
    >
      <Container as="div">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Left: content */}
          <div className="order-2 lg:order-1">
            <h1
              id="hero-heading"
              className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.2] xl:text-5xl"
            >
              {heading}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:mt-8">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-6 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
              <Link
                href={ctaLink}
                className="inline-flex w-fit rounded-full bg-blue-600 px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {ctaText}
              </Link>
              {showPhoneBlock && (
                <div className="border-l-2 border-border pl-5 sm:pl-6">
                  {phoneText && (
                    <p className="text-sm font-medium text-foreground">
                      {phoneText}
                    </p>
                  )}
                  {badgeText && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{badgeText}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: hero image with decorative shapes */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted sm:aspect-[6/5] lg:aspect-[4/3]">
              <Image
                src="/images/hero.png"
                alt="Agency team or digital services"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Decorative shapes - abstract circles and blobs */}
              <span
                className="absolute -left-4 -top-4 size-24 rounded-full bg-amber-200/80 blur-2xl sm:size-32"
                aria-hidden
              />
              <span
                className="absolute -bottom-6 -right-6 size-40 rounded-full bg-pink-200/70 blur-2xl sm:size-48"
                aria-hidden
              />
              <span
                className="absolute right-8 top-1/4 size-16 rounded-full bg-blue-200/60 sm:size-20"
                aria-hidden
              />
              <span
                className="absolute bottom-1/4 left-4 size-12 rounded-full bg-amber-300/50 sm:size-14"
                aria-hidden
              />
              <span
                className="absolute left-1/2 top-6 size-8 -translate-x-1/2 rounded-full bg-blue-300/50"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
