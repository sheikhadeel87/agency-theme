import { type ReactNode } from "react";

interface AdminEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function AdminEmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: AdminEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 text-center ${className}`.trim()}
    >
      {icon && (
        <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          {icon}
        </span>
      )}
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-gray-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
