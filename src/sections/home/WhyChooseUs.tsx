import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { WhyChooseUsSettingsData } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

const PLACEHOLDERS = [
  "/images/why-choose-1.png",
  "/images/why-choose-2.png",
  "/images/why-choose-3.png",
] as const;

type Props = {
  settings: WhyChooseUsSettingsData;
};

export function WhyChooseUs({ settings }: Props) {
  const img1 = settings.image1Url || PLACEHOLDERS[0];
  const img2 = settings.image2Url || PLACEHOLDERS[1];
  const img3 = settings.image3Url || PLACEHOLDERS[2];
  const alt1 = settings.image1Alt || "Why choose us";
  const alt2 = settings.image2Alt || "Why choose us";
  const alt3 = settings.image3Alt || "Why choose us";

  return (
    <section
      id="why-choose-us"
      className="bg-muted py-16 sm:py-20 lg:py-24"
      aria-labelledby="why-choose-us-heading"
    >
      <Container as="div">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Left: image collage */}
          <div className="relative order-2 aspect-[1.02] w-full max-w-[520px] lg:order-1 lg:max-w-none">
            <div
              className="absolute left-0 top-0 z-10 w-[38%] overflow-hidden rounded-2xl bg-muted sm:rounded-3xl"
              style={{ aspectRatio: "4/5" }}
            >
              <Image
                src={img1}
                alt={alt1}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 38vw, 200px"
                unoptimized={shouldUseUnoptimizedImage(img1)}
              />
            </div>
            <div
              className="absolute bottom-0 left-0 z-10 w-[38%] overflow-hidden rounded-2xl bg-muted sm:rounded-3xl"
              style={{ aspectRatio: "4/4.5", top: "56%" }}
            >
              <Image
                src={img2}
                alt={alt2}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 38vw, 200px"
                unoptimized={shouldUseUnoptimizedImage(img2)}
              />
            </div>
            <div className="absolute right-0 top-0 z-10 h-full w-[52%] overflow-hidden rounded-2xl bg-muted sm:rounded-3xl">
              <Image
                src={img3}
                alt={alt3}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 52vw, 300px"
                unoptimized={shouldUseUnoptimizedImage(img3)}
              />
            </div>
          </div>

          {/* Right: content */}
          <div className="order-1 lg:order-2">
            {settings.sectionSubtitle ? (
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                {settings.sectionSubtitle}
              </p>
            ) : null}
            <h2
              id="why-choose-us-heading"
              className="mt-4 text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl"
            >
              {settings.sectionTitle || "We Make Our customers happy by giving Best services."}
            </h2>
            {settings.sectionDescription ? (
              <div
                className="mt-6 max-w-none prose prose-neutral dark:prose-invert sm:mt-8 prose-p:text-muted-foreground prose-p:sm:text-lg prose-headings:text-foreground prose-a:text-blue-600 dark:prose-a:text-blue-400"
                dangerouslySetInnerHTML={{ __html: settings.sectionDescription }}
              />
            ) : null}
            {(settings.ctaText || settings.ctaLink) && (
              <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
                <Link
                  href={settings.ctaLink || "/#how-we-work"}
                  className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:size-16"
                  aria-label={settings.ctaText ? `Play: ${settings.ctaText}` : "See how we work"}
                >
                  {/* Inline SVG avoids Lucide hydration mismatches (server/client SVG attrs). */}
                  <svg
                    className="ml-1 size-6 fill-current sm:size-7"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </Link>
                <span className="text-sm font-semibold uppercase tracking-wider text-foreground sm:text-base">
                  {settings.ctaText || "See How We Work"}
                </span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
