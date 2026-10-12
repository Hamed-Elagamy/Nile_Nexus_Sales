"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Plus,
  Tag,
  Pencil,
  Trash2,
  AlertTriangle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createService,
  updateService,
  deleteService,
} from "@/lib/actions/settings";
import type { Service } from "@/types/domain";

interface ServicesCatalogProps {
  services: Service[];
  userRole?: string;
}

export function ServicesCatalog({ services, userRole = "SALES" }: ServicesCatalogProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canManage = userRole === "GM" || userRole === "ADMIN";

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"order" | "price_desc" | "price_asc" | "name_ar" | "name_en">("order");
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Create Modal State
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("EGP");

  // Edit Modal State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCurrency, setEditCurrency] = useState("EGP");

  // Delete Modal State
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  // Filtered & Sorted Services
  const filteredServices = useMemo(() => {
    let list = [...services];

    // Status filter
    if (statusFilter === "active") {
      list = list.filter((s) => s.is_active);
    } else if (statusFilter === "inactive") {
      list = list.filter((s) => !s.is_active);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((s) => {
        const ar = (s.name_ar || "").toLowerCase();
        const en = (s.name_en || "").toLowerCase();
        const p = s.internal_reference_price ? String(s.internal_reference_price) : "";
        const o = s.sort_order !== undefined && s.sort_order !== null ? String(s.sort_order) : "";
        return ar.includes(q) || en.includes(q) || p.includes(q) || o.includes(q);
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "order") {
        return (a.sort_order ?? 9999) - (b.sort_order ?? 9999);
      }
      if (sortBy === "price_desc") {
        return (Number(b.internal_reference_price) || 0) - (Number(a.internal_reference_price) || 0);
      }
      if (sortBy === "price_asc") {
        return (Number(a.internal_reference_price) || 0) - (Number(b.internal_reference_price) || 0);
      }
      if (sortBy === "name_ar") {
        return (a.name_ar || "").localeCompare(b.name_ar || "", "ar");
      }
      if (sortBy === "name_en") {
        return (a.name_en || "").localeCompare(b.name_en || "", "en");
      }
      return 0;
    });

    return list;
  }, [services, searchQuery, statusFilter, sortBy]);

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredServices.length / pageSize));

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy, pageSize]);

  // Paginated slice
  const paginatedServices = useMemo(() => {
    if (pageSize === -1) return filteredServices;
    const start = (currentPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, currentPage, pageSize]);

  const activeCount = useMemo(() => services.filter((s) => s.is_active).length, [services]);

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setEditNameAr(service.name_ar);
    setEditNameEn(service.name_en);
    setEditPrice(service.internal_reference_price ? String(service.internal_reference_price) : "");
    setEditCurrency(service.currency || "EGP");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !nameEn) {
      toast.error(t("fillBothNames"));
      return;
    }

    startTransition(async () => {
      const res = await createService({
        name_ar: nameAr.trim(),
        name_en: nameEn.trim(),
        internal_reference_price: price ? parseFloat(price) : undefined,
        currency,
        sort_order: services.length + 1,
      });

      if (res.success) {
        toast.success(t("serviceAdded"));
        setOpenCreateDialog(false);
        setNameAr("");
        setNameEn("");
        setPrice("");
        router.refresh();
      } else {
        toast.error(res.error || t("serviceAddFailed"));
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    if (!editNameAr || !editNameEn) {
      toast.error(t("fillBothNames"));
      return;
    }

    startTransition(async () => {
      const res = await updateService(editingService.id, {
        name_ar: editNameAr.trim(),
        name_en: editNameEn.trim(),
        internal_reference_price: editPrice ? parseFloat(editPrice) : null,
        currency: editCurrency,
      });

      if (res.success) {
        toast.success(t("serviceUpdated"));
        setEditingService(null);
        router.refresh();
      } else {
        toast.error(res.error || t("serviceUpdateFailed"));
      }
    });
  };

  const handleDelete = () => {
    if (!deletingService) return;

    startTransition(async () => {
      const res = await deleteService(deletingService.id);

      if (res.success) {
        if (res.warning === "serviceInUseArchived") {
          toast.warning(t("serviceInUseArchived"));
        } else {
          toast.success(t("serviceDeleted"));
        }
        setDeletingService(null);
        router.refresh();
      } else {
        toast.error(res.error || t("serviceDeleteFailed"));
      }
    });
  };

  const handleToggleActive = (service: Service) => {
    startTransition(async () => {
      const res = await updateService(service.id, {
        is_active: !service.is_active,
      });

      if (res.success) {
        toast.success(t("serviceStatusUpdated"));
        router.refresh();
      } else {
        toast.error(res.error || t("serviceStatusFailed"));
      }
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("order");
    setCurrentPage(1);
  };

  const isFiltered = searchQuery.trim() !== "" || statusFilter !== "all" || sortBy !== "order";

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">{t("servicesCatalogTitle")}</h2>
            <Badge variant="outline" className="text-xs font-mono font-semibold bg-primary/10 text-primary border-primary/20">
              {services.length} {t("services")}
            </Badge>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              {activeCount} {t("active")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("servicesCatalogDesc")}
          </p>
        </div>

        {canManage && (
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5 cursor-pointer self-start sm:self-auto">
                  <Plus className="h-4 w-4" />
                  <span>{t("addService")}</span>
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <span>{t("addServiceTitle")}</span>
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">{t("serviceNameAr")}</label>
                  <Input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder={t("serviceNameArPlaceholder")}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">{t("serviceNameEn")}</label>
                  <Input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder={t("serviceNameEnPlaceholder")}
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">{t("referencePrice")}</label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={t("referencePricePlaceholder")}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">{t("currency")}</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-card px-2.5 text-xs"
                    >
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenCreateDialog(false)}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? t("saving") : tCommon("save")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search, Filter & Sort Controls Bar */}
      <div className="p-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchServicesPlaceholder")}
              className="h-9 ps-8 pe-8 text-xs bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                title={t("clearSearch")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs cursor-pointer"
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="active">{t("activeOnly")}</option>
              <option value="inactive">{t("inactiveOnly")}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs cursor-pointer"
            >
              <option value="order">{t("sortByOrder")}</option>
              <option value="price_desc">{t("sortByPriceDesc")}</option>
              <option value="price_asc">{t("sortByPriceAsc")}</option>
              <option value="name_ar">{t("sortByNameAr")}</option>
              <option value="name_en">{t("sortByNameEn")}</option>
            </select>
          </div>
        </div>

        {/* Sub-bar: Result Count, Reset & Per Page Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              {t("showingServicesCount", {
                showing: paginatedServices.length,
                total: filteredServices.length,
              })}
            </span>
            {isFiltered && (
              <Button
                size="xs"
                variant="ghost"
                onClick={handleClearFilters}
                className="h-6 px-2 text-xs text-primary hover:bg-primary/10 gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>{t("resetFilters")}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span>{t("perPage")}</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-7 rounded border border-input bg-background px-2 text-xs cursor-pointer font-mono"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>{t("allPages")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3 text-start w-12">{t("serviceNumber")}</th>
                <th className="p-3 text-start">{t("serviceColName")}</th>
                <th className="p-3 text-start">{t("serviceColNameEn")}</th>
                <th className="p-3 text-start">{t("serviceColPrice")}</th>
                <th className="p-3 text-center w-24">{t("serviceColStatus")}</th>
                {canManage && <th className="p-3 text-end w-44">{tCommon("actions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedServices.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Tag className="h-8 w-8 text-muted-foreground/40" />
                      <p className="font-medium text-foreground">{t("noServicesFound")}</p>
                      {isFiltered && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClearFilters}
                          className="mt-2 text-xs gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>{t("resetFilters")}</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedServices.map((s, idx) => {
                  const itemIndex = s.sort_order ?? (pageSize === -1 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1);
                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-muted-foreground text-[11px] font-semibold">
                        #{itemIndex}
                      </td>
                      <td className="p-3 font-semibold text-foreground">
                        {s.name_ar}
                      </td>
                      <td className="p-3 text-muted-foreground font-mono text-[11px]">
                        {s.name_en}
                      </td>
                      <td className="p-3 text-start font-mono font-semibold text-foreground">
                        {s.internal_reference_price ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-[11px] text-muted-foreground font-sans">
                              {t("starterPricePrefix")}
                            </span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                              {Number(s.internal_reference_price).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {s.currency}
                            </span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {s.is_active ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] font-medium"
                          >
                            {t("active")}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[11px] font-medium"
                          >
                            {t("inactive")}
                          </Badge>
                        )}
                      </td>
                      {canManage && (
                        <td className="p-3 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleOpenEdit(s)}
                              disabled={isPending}
                              className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                              title={t("editService")}
                            >
                              <Pencil className="h-3 w-3" />
                              <span className="hidden sm:inline">{tCommon("edit")}</span>
                            </Button>

                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleToggleActive(s)}
                              disabled={isPending}
                              className="h-7 px-2 text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                            >
                              {s.is_active ? t("deactivate") : t("activate")}
                            </Button>

                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setDeletingService(s)}
                              disabled={isPending}
                              className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              title={t("deleteService")}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pageSize !== -1 && totalPages > 1 && (
          <div className="p-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground order-2 sm:order-1">
              {t("page")} <span className="font-mono font-bold text-foreground">{currentPage}</span> {t("of")}{" "}
              <span className="font-mono font-bold text-foreground">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1 order-1 sm:order-2">
              <Button
                size="xs"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 text-xs gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-3.5 w-3.5 rtl:rotate-0 rotate-180" />
                <span>{t("previousPage")}</span>
              </Button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-1 text-muted-foreground font-mono">…</span>
                        )}
                        <Button
                          size="xs"
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className={`h-8 w-8 p-0 font-mono text-xs cursor-pointer ${
                            currentPage === page ? "font-bold" : ""
                          }`}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <Button
                size="xs"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 text-xs gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{t("nextPage")}</span>
                <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-0 rotate-180" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" />
                <span>{t("editServiceTitle")}</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{t("serviceNameAr")}</label>
                <Input
                  value={editNameAr}
                  onChange={(e) => setEditNameAr(e.target.value)}
                  placeholder={t("serviceNameArPlaceholder")}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{t("serviceNameEn")}</label>
                <Input
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  placeholder={t("serviceNameEnPlaceholder")}
                  required
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">{t("referencePrice")}</label>
                  <Input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder={t("referencePricePlaceholder")}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">{t("currency")}</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-card px-2.5 text-xs"
                  >
                    <option value="EGP">EGP</option>
                    <option value="USD">USD</option>
                    <option value="SAR">SAR</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingService(null)}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? t("saving") : tCommon("save")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deletingService && (
        <Dialog open={!!deletingService} onOpenChange={(open) => !open && setDeletingService(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <span>{t("deleteService")}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs text-muted-foreground">
              <p>{t("confirmDeleteService")}</p>
              <div className="p-3 rounded-lg border border-border bg-muted/30 font-medium text-foreground">
                <p className="font-bold">{deletingService.name_ar}</p>
                <p className="font-mono text-muted-foreground text-[11px]">{deletingService.name_en}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingService(null)}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? t("saving") : t("deleteService")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
