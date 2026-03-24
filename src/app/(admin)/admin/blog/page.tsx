import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from "@/components/admin/AdminTable";
import { getBlogPosts, getSiteSettings } from "@/lib/admin-data";
import { DeleteBlogButton } from "@/components/admin/DeleteBlogButton";
import { AdminHomepageSectionLiveToggle } from "@/components/admin/AdminHomepageSectionLiveToggle";

const primaryButtonClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const linkButtonClass =
  "inline-flex h-7 items-center text-[0.8rem] font-medium text-primary underline-offset-4 hover:underline";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default async function BlogPage() {
  const [posts, siteSettings] = await Promise.all([getBlogPosts(), getSiteSettings()]);
  const sectionLive = siteSettings?.blogSectionEnabled !== false;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blog"
        description="Manage blog posts and publishing."
      >
        <Link href="/admin/blog/new" className={primaryButtonClass}>
          <Plus className="size-4" />
          New Post
        </Link>
      </AdminPageHeader>
      <AdminHomepageSectionLiveToggle
        module="blog"
        initialEnabled={sectionLive}
        title="Blog on live site"
        description="Homepage block, blog archive, and post pages, plus Blog in navigation. Matches Site Settings → Homepage sections."
      />
      {posts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            No posts yet. Create your first post to get started.
          </p>
          <Link href="/admin/blog/new" className={`${primaryButtonClass} mt-4 inline-flex`}>
            New Post
          </Link>
        </div>
      ) : (
        <>
          <AdminTable headers={["Title", "Author", "Homepage", "Status", "Date"]}>
            {posts.map((p) => (
              <AdminTableRow key={p._id}>
                <AdminTableCell className="font-medium text-foreground">
                  {p.title || "Untitled"}
                </AdminTableCell>
                <AdminTableCell className="text-muted-foreground">
                  {p.author || "—"}
                </AdminTableCell>
                <AdminTableCell>
                  {p.is_featured ? (
                    <Badge variant="secondary">Yes</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </AdminTableCell>
                <AdminTableCell>
                  <Badge variant={p.is_published ? "default" : "secondary"}>
                    {p.is_published ? "Published" : "Draft"}
                  </Badge>
                </AdminTableCell>
                <AdminTableCell className="text-muted-foreground">
                  {formatDate(p.publishedAt ?? p.createdAt)}
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <span className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/blog/edit/${p._id}`}
                      className={linkButtonClass}
                    >
                      Edit
                    </Link>
                    <DeleteBlogButton postId={p._id} postTitle={p.title || "this post"} />
                  </span>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
          <p className="text-xs text-muted-foreground">
            The homepage shows up to 3 published posts: &quot;Show on homepage (featured)&quot; first (newest), then the latest published to fill.
          </p>
        </>
      )}
    </div>
  );
}
