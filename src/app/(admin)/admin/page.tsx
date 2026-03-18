import {
  Settings,
  Home,
  Briefcase,
  ImageIcon,
  Users,
  FileText,
  FileStack,
  Scale,
  MapPin,
  DollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { getDashboardModules } from "@/lib/admin-data";

const iconMap: Record<string, LucideIcon> = {
  Settings,
  Home,
  Briefcase,
  ImageIcon,
  Users,
  FileText,
  FileStack,
  Scale,
  MapPin,
  DollarSign,
};

export default async function AdminDashboardPage() {
  const modules = await getDashboardModules();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your site content. Choose a module to manage.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map(({ title, href, icon }) => (
          <AdminStatCard
            key={href}
            title={title}
            href={href}
            icon={iconMap[icon]}
          />
        ))}
      </div>
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          Forms and data will be added in the next phase. This is the admin
          shell only.
        </p>
      </Card>
    </div>
  );
}
