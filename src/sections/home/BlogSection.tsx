import Image from "next/image";
import Link from "next/link";
import { User, Calendar } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { BlogPost } from "@/lib/admin-data";

export type BlogSectionProps = {
  posts: BlogPost[];
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function BlogSection({ posts }: BlogSectionProps) {
  const published = posts.filter((p) => p.is_published);

  return (
    <section
      id="blog"
      className="bg-[#fafafa] py-16 sm:py-20 lg:py-24"
      aria-labelledby="blog-heading"
    >
      <Container as="div">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="blog-heading"
            className="text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl lg:text-4xl"
          >
            Latest Blogs & News
          </h2>
          <p className="mt-4 text-gray-600 sm:mt-6 sm:text-lg">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using.
          </p>
        </header>

        <ul className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 sm:mt-16 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {published.map((post) => (
            <li key={post._id}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
                <Link
                  href={post.slug ? `/blog/${encodeURIComponent(post.slug)}` : "/blog"}
                  className="block flex-1"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
                    <Image
                      src={post.imageUrl || "/images/blog-1.png"}
                      alt={post.title || ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <User className="size-4 shrink-0" aria-hidden />
                        {post.author || "—"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-4 shrink-0" aria-hidden />
                        {formatDate(post.publishedAt ?? post.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold leading-snug text-[#0f172a] sm:text-xl">
                      {post.title || "Untitled"}
                    </h3>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
