"use client";

import React from "react";
import { detectPhoneCarrier } from "@/lib/utils/phone-carrier";

interface PhoneCarrierBadgeProps {
  phone?: string | null;
  showText?: boolean;
  className?: string;
}

export function PhoneCarrierBadge({
  phone,
  showText = true,
  className = "",
}: PhoneCarrierBadgeProps) {
  const info = detectPhoneCarrier(phone);
  if (!info) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${info.badgeColor} ${className}`}
      title={`شبكة الاتصال: ${info.name_ar} (${info.name_en})`}
    >
      <span>{info.name_ar}</span>
    </span>
  );
}
