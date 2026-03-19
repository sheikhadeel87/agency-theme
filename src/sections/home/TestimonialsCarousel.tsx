"use client";

import { useState } from "react";
import Image from "next/image";
import { Quote, ChevronLeft, ChevronRight, Droplet } from "lucide-react";
import type { TestimonialItem } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

const PLACEHOLDER_IMAGE = "/images/client.png";

type Props = {
  testimonials: TestimonialItem[];
};

export function TestimonialsCarousel({ testimonials }: Props) {
  const [index, setIndex] = useState(0);
  const hasMultiple = testimonials.length > 1;
  const current = testimonials[index];

  if (testimonials.length === 0) return null;

  const imgSrc = current.imageUrl || PLACEHOLDER_IMAGE;
  const goPrev = () => setIndex((i) => (i <= 0 ? testimonials.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i >= testimonials.length - 1 ? 0 : i + 1));

  return (
    <div className="relative mx-auto mt-12 w-full max-w-[1150px] sm:mt-16">
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-md sm:rounded-3xl lg:h-[372px]">
        <div className="grid grid-cols-1 items-stretch gap-8 p-6 sm:p-8 lg:grid-cols-[300px_1fr] lg:gap-10 lg:h-full lg:p-10">
          <div className="flex min-h-0 w-full items-center justify-center lg:min-w-[300px]">
            <div className="relative h-0 w-full max-w-[280px] shrink-0 overflow-hidden rounded-xl bg-gray-200 pb-[100%] sm:max-w-[300px] lg:max-w-none lg:h-[300px] lg:w-[300px] lg:pb-0">
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
          <div className="flex flex-col justify-center">
            <Quote className="size-14 text-gray-300 sm:size-16" aria-hidden />
            <blockquote className="mt-4 italic text-gray-600 sm:mt-5 sm:text-lg">
              {current.quote || "No quote."}
            </blockquote>
            <footer className="mt-6 flex flex-col gap-0.5 sm:mt-8">
              <cite className="not-italic font-bold text-[#0f172a]">
                {current.authorName || "—"}
              </cite>
              {(current.designation || current.brandName) && (
                <p className="text-sm text-gray-600">
                  {[current.designation, current.brandName].filter(Boolean).join(" · ")}
                </p>
              )}
            </footer>
            {current.brandName && (
              <p className="mt-auto flex items-center justify-end gap-1.5 pt-6 text-right text-sm font-medium text-gray-600 sm:pt-8">
                <Droplet className="size-4 shrink-0" aria-hidden />
                <span className="uppercase tracking-wider">{current.brandName}</span>
              </p>
            )}
          </div>
        </div>
        <div className="absolute right-0 top-0 h-1/2 w-1 bg-blue-500 sm:w-1.5" aria-hidden />
        <div className="absolute bottom-0 right-0 h-1/2 w-1 bg-pink-400 sm:w-1.5" aria-hidden />
      </div>

      {hasMultiple && (
        <div className="mt-8 flex items-center justify-center gap-4 sm:mt-10">
          <button
            type="button"
            onClick={goPrev}
            className="flex size-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="flex size-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      )}
    </div>
  );
}
