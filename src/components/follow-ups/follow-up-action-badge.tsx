"use client";

import React from "react";
import {
  Phone,
  Video,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FollowUpActionBadgeProps {
  action: string;
}

export function FollowUpActionBadge({ action }: FollowUpActionBadgeProps) {
  const normAction = action.toUpperCase();

  switch (normAction) {
    case "CALL":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 gap-1 text-xs font-medium"
        >
          <Phone className="h-3 w-3" />
          <span>اتصال</span>
        </Badge>
      );
    case "MEETING":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 gap-1 text-xs font-medium"
        >
          <Video className="h-3 w-3" />
          <span>اجتماع</span>
        </Badge>
      );
    case "WHATSAPP":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 gap-1 text-xs font-medium"
        >
          <MessageSquare className="h-3 w-3" />
          <span>واتساب</span>
        </Badge>
      );
    case "EMAIL":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 gap-1 text-xs font-medium"
        >
          <Mail className="h-3 w-3" />
          <span>إيميل</span>
        </Badge>
      );
    case "VISIT":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 gap-1 text-xs font-medium"
        >
          <MapPin className="h-3 w-3" />
          <span>زيارة ميدانية</span>
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border gap-1 text-xs font-medium"
        >
          <Clock className="h-3 w-3" />
          <span>{action}</span>
        </Badge>
      );
  }
}
