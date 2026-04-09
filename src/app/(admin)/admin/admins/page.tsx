import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminsIndexPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admins"
        description="Create additional admin accounts with a display name, email, and password."
      />
      <Link href="/admin/admins/new" className={cn(buttonVariants())}>
        New admin
      </Link>
    </div>
  );
}
