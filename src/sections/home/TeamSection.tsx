import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { TeamSettingsData, TeamMember } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

type Props = {
  settings: TeamSettingsData;
  members: TeamMember[];
};

export function TeamSection({ settings, members }: Props) {
  return (
    <section
      id="team"
      className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
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
            className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl"
          >
            {settings.sectionTitle || "Meet With Our Creative Dedicated Team"}
          </h2>
          {settings.sectionDescription ? (
            <p className="mt-4 text-muted-foreground sm:mt-6 sm:text-lg">
              {settings.sectionDescription}
            </p>
          ) : null}
        </header>

        {members.length > 0 ? (
          <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 sm:mt-16 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {members.map((member) => {
              const profileHref = `/team/${encodeURIComponent(member.slug?.trim() || member._id)}`;
              return (
                <li key={member._id}>
                  <article className="flex flex-col items-center text-center">
                    <Link
                      href={profileHref}
                      className="group relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl bg-muted outline-none ring-blue-500/0 transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:rounded-3xl"
                      aria-label={`View profile of ${member.name}`}
                    >
                      {member.imageUrl ? (
                        <Image
                          src={member.imageUrl}
                          alt={member.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized={shouldUseUnoptimizedImage(member.imageUrl)}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-4xl font-semibold text-muted-foreground transition group-hover:bg-muted-foreground/10">
                          {member.name.charAt(0) || "?"}
                        </div>
                      )}
                    </Link>
                    <h3 className="mt-6 text-lg font-semibold text-foreground sm:text-xl">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-muted-foreground">{member.role}</p>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : null}
      </Container>
    </section>
  );
}
