import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";

export const dynamic = "force-dynamic";

export default function NewAdminPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New admin"
        description="Set name, email, and password. The new user can sign in on the admin login page."
      />
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <CreateAdminForm />
      </div>
      <p className="text-sm">
        <Link href="/admin/admins" className="font-medium text-primary hover:underline">
          ← Back to admins
        </Link>
      </p>
    </div>
  );
}
