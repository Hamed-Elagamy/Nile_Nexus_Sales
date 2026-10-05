import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientType } from "@/lib/schemas/client";

interface ClientTypeBadgeProps {
  type: ClientType;
  label?: string;
  className?: string;
}

export function ClientTypeBadge({ type, label, className }: ClientTypeBadgeProps) {
  const isCompany = type === "COMPANY";

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5 border",
        isCompany
          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
          : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
        className
      )}
    >
      {isCompany ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
      <span>{label || (isCompany ? "شركة" : "فرد")}</span>
    </Badge>
  );
}
