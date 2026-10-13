"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Globe,
  Share2,
  Sparkles,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  Rocket,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PotentialClientStatusBadge } from "./status-badge";
import { WhatsAppQuickDialog } from "@/components/shared/whatsapp-quick-dialog";
import { EditPotentialClientDialog } from "./edit-potential-client-dialog";
import {
  updatePotentialClient,
  updatePotentialClientStatus,
  deletePotentialClient,
  type PotentialClientWithRelations,
} from "@/lib/actions/potential-clients";
import {
  OPPORTUNITY_INDICATORS,
  type OpportunityIndicatorType,
  type PotentialClientStatusType,
} from "@/lib/schemas/potential-client";

interface PotentialClientDetailProps {
  client: PotentialClientWithRelations;
  userRole?: string;
}

export function PotentialClientDetail({ client, userRole = "SALES" }: PotentialClientDetailProps) {
  const t = useTranslations("potentialClients");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [currentClient, setCurrentClient] = useState<PotentialClientWithRelations>(client);
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState<PotentialClientStatusType>(
    currentClient.status as PotentialClientStatusType
  );
  const [notes, setNotes] = useState(currentClient.notes || "");
  const [opportunities, setOpportunities] = useState<OpportunityIndicatorType[]>(
    (currentClient.opportunities as OpportunityIndicatorType[]) || []
  );

  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = userRole === "GM" || userRole === "ADMIN";

  const cleanPhone = currentClient.phone?.replace(/[^0-9]/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}`
    : null;

  const handleStatusChange = (newStatus: PotentialClientStatusType) => {
    startTransition(async () => {
      const res = await updatePotentialClientStatus(currentClient.id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        toast.success(t("statusUpdated"));
        router.refresh();
      } else {
        toast.error(res.error || tCommon("error"));
      }
    });
  };

  const handleSaveNotes = () => {
    startTransition(async () => {
      const res = await updatePotentialClient(currentClient.id, {
        notes,
        opportunities,
      });
      if (res.success && res.data) {
        setCurrentClient(res.data);
        toast.success(t("updatedSuccess"));
        router.refresh();
      } else {
        toast.error(res.error || tCommon("error"));
      }
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deletePotentialClient(currentClient.id);
      if (res.success) {
        toast.success(t("deletedSuccess"));
        router.push("/potential-clients");
      } else {
        toast.error(res.error || t("deleteFailed"));
      }
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleOpportunity = (opp: OpportunityIndicatorType) => {
    setOpportunities((prev) =>
      prev.includes(opp) ? prev.filter((o) => o !== opp) : [...prev, opp]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <Link
            href="/potential-clients"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{t("backToList")}</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{currentClient.name}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {currentClient.business_id}
            </span>
            <PotentialClientStatusBadge
              status={currentStatus}
              label={t(`status.${currentStatus}`)}
            />
          </div>
          {currentClient.area ? (
            <p className="text-sm text-muted-foreground">{currentClient.area}</p>
          ) : (
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>+ {t("addArea")}</span>
            </button>
          )}
        </div>

        {/* Workflow Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>{t("edit")}</span>
          </Button>

          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isDeleting}
              className="gap-1.5 text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t("delete")}</span>
            </Button>
          )}

          {currentStatus !== "RESEARCHING" && currentStatus !== "CONVERTED" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleStatusChange("RESEARCHING")}
              className="gap-1.5 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{t("statusActions.startResearch")}</span>
            </Button>
          )}

          {currentStatus !== "RESEARCHED" && currentStatus !== "CONVERTED" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleStatusChange("RESEARCHED")}
              className="gap-1.5 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("statusActions.finishResearch")}</span>
            </Button>
          )}

          {currentStatus !== "CONVERTED" && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => setConvertModalOpen(true)}
              className="gap-1.5 text-xs bg-primary text-primary-foreground font-medium shadow-xs"
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>{t("convert")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Info + Opportunities + Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Metadata (1 col) */}
        <div className="space-y-6">
          {/* Quick Contact Card */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">{t("contactInfo")}</CardTitle>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setEditModalOpen(true)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title={t("edit")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {currentClient.phone ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                  <span className="font-mono text-xs" dir="ltr">{currentClient.phone}</span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${currentClient.phone}`}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      title={tCommon("call")}
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    {currentClient.phone && (
                      <WhatsAppQuickDialog
                        phone={currentClient.phone}
                        recipientName={currentClient.name}
                        contextType="lead"
                        trigger={
                          <button
                            type="button"
                            className="p-1.5 rounded-md hover:bg-emerald-100 text-emerald-600 cursor-pointer"
                            title={tCommon("whatsapp")}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        }
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{t("noPhone")}</p>
                    <p className="text-[11px] text-muted-foreground">{t("missingData")}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditModalOpen(true)}
                    className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/5"
                  >
                    + {t("addPhone")}
                  </Button>
                </div>
              )}

              {/* Online Links */}
              <div className="space-y-2 pt-1">
                {currentClient.website && (
                  <a
                    href={currentClient.website.startsWith("http") ? currentClient.website : `https://${currentClient.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span className="truncate">{currentClient.website}</span>
                  </a>
                )}
                {currentClient.instagram && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="truncate">{currentClient.instagram}</span>
                  </div>
                )}
                {currentClient.facebook && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="truncate">{currentClient.facebook}</span>
                  </div>
                )}
                {!currentClient.website && !currentClient.instagram && !currentClient.facebook && (
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(true)}
                    className="text-xs text-primary hover:underline flex items-center gap-1.5 pt-1 cursor-pointer"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>+ {t("addWebsite")} / {t("addSocials")}</span>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{t("researchDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{t("owner")}</span>
                <span className="font-medium text-foreground">
                  {currentClient.research_owner?.full_name || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("registeredDate")}</span>
                <span className="font-medium text-foreground">
                  {new Date(currentClient.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {currentClient.source && (
                <div className="flex items-center justify-between">
                  <span>{t("source")}:</span>
                  <span className="font-medium text-foreground">
                    {currentClient.source.name_ar}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Columns: Opportunities & Notes (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Opportunities Selector Card */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{t("discoveredOpportunities")}</span>
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {t("selectFieldsNeeded")}
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OPPORTUNITY_INDICATORS.map((opp) => {
                  const isSelected = opportunities.includes(opp);
                  return (
                    <button
                      key={opp}
                      type="button"
                      onClick={() => toggleOpportunity(opp)}
                      className={`text-xs px-3 py-2 rounded-lg border transition-all text-center flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      <span>{t(`indicators.${opp}`)}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Research Notes & Findings */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">{t("researchNotesAndFindings")}</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveNotes}
                disabled={isPending}
                className="gap-1.5 text-xs"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>{tCommon("save")}</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={t("notesDetailedPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="resize-y"
              />
              <p className="text-[11px] text-muted-foreground">
                {t("notesTransferNotice")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Convert to Client Confirmation Dialog */}
      <Dialog open={convertModalOpen} onOpenChange={setConvertModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <span>🚀</span>
              <span>{t("convert")}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-foreground">
            <p>{t("convertConfirm")}</p>
            <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
              <p className="font-semibold text-foreground">{t("dataToTransfer")}</p>
              <p className="text-muted-foreground">{t("clientNamePrefix", { name: client.name })}</p>
              {client.phone && <p className="text-muted-foreground">{t("clientPhonePrefix", { phone: client.phone })}</p>}
              <p className="text-muted-foreground">{t("allOpportunitiesTransferred")}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConvertModalOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={() => {
                setConvertModalOpen(false);
                handleStatusChange("CONVERTED");
              }}
              className="gap-2 bg-primary text-primary-foreground font-medium"
            >
              <Rocket className="h-4 w-4" />
              <span>{t("confirmConversion")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Potential Client Details Dialog (All roles: Sales, Admin, GM) */}
      <EditPotentialClientDialog
        client={currentClient}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={(updated) => {
          setCurrentClient(updated);
          setNotes(updated.notes || "");
          setOpportunities((updated.opportunities as OpportunityIndicatorType[]) || []);
          router.refresh();
        }}
      />

      {/* Delete Confirmation Dialog (GM & ADMIN only) */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                {t("deleteTitle")}
              </DialogTitle>
            </div>
          </DialogHeader>

          <p className="text-sm text-muted-foreground leading-relaxed py-2">
            {t("deleteConfirm", { name: currentClient.name })}
          </p>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin me-1.5" />}
              <span>{t("delete")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

