import { type ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AdminTableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export function AdminTable({ headers, children, className }: AdminTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/10",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}

export function AdminTableRow({
  className,
  ...props
}: React.ComponentProps<typeof TableRow>) {
  return <TableRow className={cn(className)} {...props} />;
}

export function AdminTableCell({
  className,
  ...props
}: React.ComponentProps<typeof TableCell>) {
  return (
    <TableCell
      className={cn("px-4 py-3 first:pl-6 last:pr-6", className)}
      {...props}
    />
  );
}
