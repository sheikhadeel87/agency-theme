import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogForm } from "@/components/admin/BlogForm";

export const dynamic = "force-dynamic";

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New Post"
        description="Create a new blog post."
      />
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <BlogForm />
      </div>
    </div>
  );
}
