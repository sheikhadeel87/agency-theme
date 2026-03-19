"use client";

import { LogOut } from "lucide-react";
import { adminLogout } from "@/lib/actions/admin-auth-actions";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  return (
    <form action={adminLogout}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="size-4" aria-hidden />
        Log out
      </Button>
    </form>
  );
}
