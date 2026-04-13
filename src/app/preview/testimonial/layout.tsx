import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  ...buildPublicMetadata({
    title: "Testimonial preview | Agency Theme",
    description: "Internal preview of a testimonial layout; not indexed by search engines.",
  }),
  robots: { index: false, follow: false },
};

export default function TestimonialPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
