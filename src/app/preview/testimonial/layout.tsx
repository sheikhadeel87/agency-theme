import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonial preview | Agency Theme",
  robots: { index: false, follow: false },
};

export default function TestimonialPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
