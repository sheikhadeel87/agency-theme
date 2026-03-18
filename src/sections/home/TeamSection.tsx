import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { TeamSettingsData, TeamMember } from "@/lib/admin-data";

type Props = {
  settings: TeamSettingsData;
  members: TeamMember[];
};

export function TeamSection({ settings, members }: Props) {
  return (
    <section
      id="team"
      className="relative overflow-hidden bg-[#fafafa] py-16 sm:py-20 lg:py-24"
      aria-labelledby="team-heading"
    >
      {/* Subtle radial/curved pattern in top area */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/3 opacity-[0.06]"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, #0f172a 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <Container as="div" className="relative">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="team-heading"
            className="text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl lg:text-4xl"
          >
            {settings.sectionTitle || "Meet With Our Creative Dedicated Team"}
          </h2>
          {settings.sectionDescription ? (
            <p className="mt-4 text-gray-600 sm:mt-6 sm:text-lg">
              {settings.sectionDescription}
            </p>
          ) : null}
        </header>

        {members.length > 0 ? (
          <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 sm:mt-16 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {members.map((member) => (
              <li key={member._id}>
                <article className="flex flex-col items-center text-center">
                  <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl bg-gray-200 sm:rounded-3xl">
                    {member.imageUrl ? (
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={member.imageUrl.startsWith("/uploads/")}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-4xl font-semibold text-gray-400">
                        {member.name.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-[#0f172a] sm:text-xl">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-gray-600">{member.role}</p>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </section>
  );
}
