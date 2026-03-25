"use client";

import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminTopbarProps {
  title: string;
  onMenuClick?: () => void;
}

export function AdminTopbar({ title, onMenuClick }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMenuClick}
          className="shrink-0 sm:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      )}
      <h2 className="min-w-0 flex-1 truncate text-lg font-medium text-foreground">
        {title}
      </h2>
      <div className="flex flex-1 items-center justify-end gap-2">
        <ThemeToggle />
        <div className="hidden max-w-md flex-1 sm:block">
          <label htmlFor="admin-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="admin-search"
              type="search"
              placeholder="Search..."
              className="h-8 w-full pl-8"
            />
          </div>
        </div>
        <AdminLogoutButton />
        <button
          type="button"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Admin profile"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              A
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
