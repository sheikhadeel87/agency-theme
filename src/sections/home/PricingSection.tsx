import { Container } from "@/components/ui/Container";

const FEATURES = [
  "400 GB Storage",
  "Unlimited Photos & Videos",
  "Exclusive Support",
] as const;

const plans = [
  {
    name: "Starter",
    price: 29,
    period: "per month",
    featured: false,
    ctaVariant: "pink" as const,
  },
  {
    name: "Growth Plan",
    price: 59,
    period: "per month",
    featured: true,
    ctaVariant: "blue" as const,
  },
  {
    name: "Business",
    price: 139,
    period: "per month",
    featured: false,
    ctaVariant: "pink" as const,
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#fafafa] py-16 sm:py-20 lg:py-24"
      aria-labelledby="pricing-heading"
    >

      <Container as="div" className="relative">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="pricing-heading"
            className="text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl lg:text-4xl"
          >
            We Offer Great Affordable Premium Prices.
          </h2>
          <p className="mt-4 text-gray-600 sm:mt-6 sm:text-lg">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using.
          </p>

          {/* Billing toggle row — non-functional, styled */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10">
            <span className="text-sm font-medium text-gray-700">Bill Monthly</span>
            <div
              className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full bg-gray-200 px-1 transition-colors sm:h-9 sm:w-16"
              role="presentation"
            >
              <span
                className="block size-6 rounded-full bg-blue-600 shadow-sm transition-transform sm:size-7"
                style={{ transform: "translateX(0)" }}
              />
            </div>
            <span className="text-sm font-medium text-gray-500">Bill Annually</span>
          </div>
        </header>

        <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:mt-16 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan) => (
            <li
              key={plan.name}
              className={`flex flex-col rounded-3xl bg-white p-8 shadow-sm sm:p-10 ${
                plan.featured
                  ? "ring-2 ring-blue-500/20 ring-offset-4 ring-offset-[#fafafa] md:ring-2"
                  : ""
              }`}
            >
              <h3 className="text-xl font-semibold text-[#0f172a]">
                {plan.name}
              </h3>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
                  ${plan.price}
                </span>
                <span className="text-sm text-gray-500">/{plan.period}</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                No credit card required
              </p>
              <button
                type="button"
                className={`mt-6 w-full rounded-full py-3.5 text-sm font-medium text-white transition-colors sm:mt-8 ${
                  plan.ctaVariant === "blue"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-pink-500 hover:bg-pink-600"
                }`}
              >
                Try for free
              </button>
              <ul className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-8 sm:mt-10">
                {FEATURES.map((feature) => (
                  <li key={feature} className="text-sm text-gray-600">
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-center text-xs text-gray-500 sm:mt-8">
                7-day free trial
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
