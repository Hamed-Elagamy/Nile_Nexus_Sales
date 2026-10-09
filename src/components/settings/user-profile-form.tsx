"use client";

import React, { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Sparkles,
  Upload,
  Camera,
  X,
} from "lucide-react";
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

/**
 * Resizes and compresses any user-uploaded image into a centered square avatar
 * (320x320 JPEG, 85% quality) to guarantee lightning-fast load times and minimal storage size (~25KB-40KB).
 */
function processAndCompressImage(file: File, maxSize = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Invalid image file format"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error("Failed to read image file"));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const width = img.width;
          const height = img.height;

          // Crop square from center for a perfect circular avatar
          const cropSize = Math.min(width, height);
          const startX = (width - cropSize) / 2;
          const startY = (height - cropSize) / 2;

          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(result);
            return;
          }

          // Draw center-cropped square resized to 320x320
          ctx.drawImage(
            img,
            startX,
            startY,
            cropSize,
            cropSize,
            0,
            0,
            maxSize,
            maxSize
          );

          // Convert to compressed JPEG data URL
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve(compressedDataUrl);
        } catch {
          resolve(result);
        }
      };

      img.onerror = () => reject(new Error("Failed to process image"));
      img.src = result;
    };

    reader.onerror = () => reject(new Error("Failed to read file from device"));
    reader.readAsDataURL(file);
  });
}

export function UserProfileForm({ profile }: UserProfileFormProps) {
  const t = useTranslations("settings");
  const tTeam = useTranslations("team");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [isUploadedFromDevice, setIsUploadedFromDevice] = useState(
    Boolean(profile.avatar_url && profile.avatar_url.startsWith("data:image/"))
  );
  const [showCustomAvatarUrl, setShowCustomAvatarUrl] = useState(
    Boolean(
      profile.avatar_url &&
        !AVATAR_PRESETS.includes(profile.avatar_url) &&
        !profile.avatar_url.startsWith("data:image/")
    )
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      toast.error("Image size exceeds 12MB limit");
      return;
    }

    setIsProcessingFile(true);
    try {
      const compressedDataUrl = await processAndCompressImage(file, 320);
      setAvatarUrl(compressedDataUrl);
      setIsUploadedFromDevice(true);
      setShowCustomAvatarUrl(false);
      toast.success(t("savedSuccess"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load image";
      toast.error(msg);
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    setIsUploadedFromDevice(false);
    setShowCustomAvatarUrl(false);
  };

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
        toast.success(t("savedSuccess"));
        router.refresh();
      } else {
        toast.error(res.error || "Update failed");
      }
    });
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span>{t("profileTitle")}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                <span>{t("avatarLabel")}</span>
              </label>

              {isUploadedFromDevice && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{t("devicePhotoBadge")}</span>
                </span>
              )}
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border/70 bg-muted/20">
              {/* Clickable Avatar Circle Preview */}
              <div
                onClick={() => fileInputRef.current?.click()}
                title={t("uploadFromDevice")}
                className="group relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary/30 bg-muted flex items-center justify-center shrink-0 cursor-pointer shadow-sm hover:border-primary transition-all"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={fullName || "Avatar"}
                    className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground group-hover:opacity-70 transition-opacity">
                    {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                  </span>
                )}

                {/* Hover overlay with Camera icon */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium">
                  {isProcessingFile ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5 mb-0.5" />
                      <span>{t("uploadFromDevice")}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons & Presets */}
              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Primary: Upload From Device Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingFile || isPending}
                    className="h-9 font-semibold gap-2 border-primary/40 hover:bg-primary/5 hover:border-primary cursor-pointer text-xs"
                  >
                    {isProcessingFile ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        <span>{t("processing")}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5 text-primary" />
                        <span>{t("uploadFromDevice")}</span>
                      </>
                    )}
                  </Button>

                  {/* Toggle Custom URL */}
                  <button
                    type="button"
                    onClick={() => setShowCustomAvatarUrl(!showCustomAvatarUrl)}
                    className="h-9 px-2.5 rounded-lg border border-dashed border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{t("customUrl")}</span>
                  </button>

                  {/* Remove Photo */}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="h-9 px-2.5 rounded-lg text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>{t("removeAvatar")}</span>
                    </button>
                  )}
                </div>

                {/* Preset Avatars Row */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                    {t("orPresets")}
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(preset);
                          setIsUploadedFromDevice(false);
                          setShowCustomAvatarUrl(false);
                        }}
                        className={`relative h-7 w-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                          avatarUrl === preset
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border"
                        }`}
                        title={`Preset ${idx + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preset}
                          alt={`Preset ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct URL input if toggled */}
                {showCustomAvatarUrl && (
                  <div className="pt-1 max-w-md">
                    <Input
                      value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                      onChange={(e) => {
                        setAvatarUrl(e.target.value);
                        setIsUploadedFromDevice(false);
                      }}
                      placeholder="https://example.com/photo.jpg"
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
                {t("fullName")} *
              </label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Mohamed Hamed"
                  className="ps-9 h-10 text-sm"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-foreground">
                {t("phone")}
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
                {t("email")}
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
                {t("role")}
              </label>
              <div className="relative">
                <ShieldCheck className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  value={tTeam(`roles.${profile.role}` as any)}
                  disabled
                  className="ps-9 h-10 text-sm bg-muted/50 cursor-not-allowed font-semibold text-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isPending || isProcessingFile}
              className="px-6 h-10 font-bold gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("saving")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t("saveProfile")}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
