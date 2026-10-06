"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { User, Phone, Mail, ShieldCheck, Image as ImageIcon, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCurrentUserProfile } from "@/lib/actions/profile";
import type { Profile } from "@/types/domain";

interface UserProfileFormProps {
  profile: Profile;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
];

export function UserProfileForm({ profile }: UserProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [showCustomAvatar, setShowCustomAvatar] = useState(Boolean(profile.avatar_url && !AVATAR_PRESETS.includes(profile.avatar_url)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateCurrentUserProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        preferred_locale: profile.preferred_locale || "ar",
      });

      if (res.success) {
        toast.success("تم تحديث الملف الشخصي بنجاح! 👏");
      } else {
        toast.error(res.error || "فشل تحديث البيانات");
      }
    });
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span>الملف الشخصي والمعلومات الشخصية (My Profile)</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              <span>الصورة الشخصية (Profile Picture)</span>
            </label>

            <div className="flex flex-wrap items-center gap-4">
              {/* Preview */}
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={fullName || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">
                    {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>

              {/* Presets */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`relative h-9 w-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 cursor-pointer ${
                        avatarUrl === preset ? "border-primary ring-2 ring-primary/30" : "border-border"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preset} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowCustomAvatar(!showCustomAvatar)}
                    className="h-9 px-2.5 rounded-lg border border-dashed border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>رابط صورة مخصص</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="text-xs text-rose-500 hover:underline px-1 cursor-pointer"
                    >
                      إزالة الصورة
                    </button>
                  )}
                </div>

                {showCustomAvatar && (
                  <div className="mt-1 max-w-md">
                    <Input
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/my-photo.jpg (رابط مباشر للصورة)"
                      className="text-xs h-8 font-mono"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                الاسم الكامل (Full Name) *
              </label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="مثال: محمد حامد"
                  className="ps-9 h-10 text-sm"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-foreground">
                رقم الهاتف / الواتساب (Phone Number)
              </label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+201012345678"
                  className="ps-9 h-10 text-sm font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                البريد الإلكتروني (Email)
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={profile.email}
                  disabled
                  className="ps-9 h-10 text-sm bg-muted/50 cursor-not-allowed font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                الدور الوظيفي (Role)
              </label>
              <div className="relative">
                <ShieldCheck className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  value={`${profile.role} (${profile.role === "GM" ? "المدير العام" : profile.role === "ADMIN" ? "مشرف" : "مبيعات"})`}
                  disabled
                  className="ps-9 h-10 text-sm bg-muted/50 cursor-not-allowed font-semibold text-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="px-6 h-10 font-bold gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>حفظ التعديلات (Save Profile)</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
