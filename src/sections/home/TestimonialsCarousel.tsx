"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Quote, ChevronLeft, ChevronRight, Droplet } from "lucide-react";
import type { TestimonialItem } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

const PLACEHOLDER_IMAGE = "/images/client.png";

type Props = {
  testimonials: TestimonialItem[];
};

export function TestimonialsCarousel({ testimonials }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: testimonials.length > 1,
    align: "start",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (testimonials.length === 0) return null;

  const hasMultiple = testimonials.length > 1;

  return (
    <div className="relative mx-auto mt-12 w-full max-w-[1150px] sm:mt-16">
      <div className="overflow-hidden rounded-2xl bg-muted shadow-md sm:rounded-3xl" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((current) => {
            const imgSrc = current.imageUrl || PLACEHOLDER_IMAGE;
            return (
              <div
                key={current._id}
                className="min-w-0 shrink-0 grow-0 basis-full lg:min-h-[372px]"
              >
                <div className="relative grid grid-cols-1 items-stretch gap-8 p-6 sm:p-8 lg:grid-cols-[300px_1fr] lg:gap-10 lg:min-h-[372px] lg:p-10">
                  <div className="flex min-h-0 w-full items-center justify-center self-stretch lg:min-w-[300px]">
                    <div className="relative h-0 w-full max-w-[280px] shrink-0 overflow-hidden rounded-xl bg-muted pb-[100%] sm:max-w-[300px] lg:max-w-none lg:h-[300px] lg:w-[300px] lg:pb-0">
                      <Image
                        src={imgSrc}
                        alt={current.authorName || "Client"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 300px, 300px"
                        unoptimized={shouldUseUnoptimizedImage(imgSrc)}
                      />
                    </div>
                  </div>
                  <div className="flex min-h-0 flex-col justify-start">
                    <Quote className="size-14 text-muted-foreground/40 sm:size-16" aria-hidden />
                    <blockquote className="mt-4 italic text-muted-foreground sm:mt-5 sm:text-lg">
                      {current.quote || "No quote."}
                    </blockquote>
                    <footer className="mt-6 flex flex-col gap-0.5 sm:mt-8">
                      <cite className="not-italic font-bold text-foreground">
                        {current.authorName || "—"}
                      </cite>
                      {(current.designation || current.brandName) && (
                        <p className="text-sm text-muted-foreground">
                          {[current.designation, current.brandName].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </footer>
                    {current.brandName && (
                      <p className="mt-6 flex items-center justify-end gap-1.5 text-right text-sm font-medium text-muted-foreground sm:mt-8">
                        <Droplet className="size-4 shrink-0" aria-hidden />
                        <span className="uppercase tracking-wider">{current.brandName}</span>
                      </p>
                    )}
                  </div>
                  <div className="pointer-events-none absolute right-0 top-0 h-1/2 w-1 bg-blue-500 sm:w-1.5" aria-hidden />
                  <div className="pointer-events-none absolute bottom-0 right-0 h-1/2 w-1 bg-pink-400 sm:w-1.5" aria-hidden />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hasMultiple && (
        <div className="mt-8 flex items-center justify-center gap-4 sm:mt-10">
          <button
            type="button"
            onClick={scrollPrev}
            className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      )}
    </div>
  );
}
