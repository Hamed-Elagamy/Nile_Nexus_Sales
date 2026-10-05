"use client";

import React, { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { CheckCircle2, Inbox } from "lucide-react";
import { FollowUpsFilter } from "./follow-ups-filter";
import { FollowUpCard } from "./follow-up-card";
import { CreateFollowUpDialog } from "./create-follow-up-dialog";
import {
  getFollowUps,
  type FollowUpsDashboardResult,
} from "@/lib/actions/follow-ups";

interface FollowUpsClientProps {
  initialData?: FollowUpsDashboardResult;
  clients?: Array<{ id: string; name: string; business_id: string }>;
}

export function FollowUpsClient({
  initialData,
  clients = [],
}: FollowUpsClientProps) {
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<FollowUpsDashboardResult>(
    initialData || {
      items: [],
      counts: { today: 0, overdue: 0, upcoming: 0, completed: 0, all: 0 },
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    }
  );

  const [currentTab, setCurrentTab] = useState<
    "TODAY" | "OVERDUE" | "UPCOMING" | "COMPLETED" | "ALL"
  >("TODAY");
  const [currentAction, setCurrentAction] = useState<string | undefined>();

  const loadData = useCallback(
    (tab = currentTab, action = currentAction, page = 1) => {
      startTransition(async () => {
        const res = await getFollowUps({
          tab,
          action,
          page,
          pageSize: 20,
        });

        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.error || "فشل تحميل المتابعات");
        }
      });
    },
    [currentTab, currentAction]
  );

  const handleTabChange = (newTab: "TODAY" | "OVERDUE" | "UPCOMING" | "COMPLETED" | "ALL") => {
    setCurrentTab(newTab);
    loadData(newTab, currentAction, 1);
  };

  const handleActionChange = (newAction?: string) => {
    setCurrentAction(newAction);
    loadData(currentTab, newAction, 1);
  };

  const handleRefresh = () => {
    loadData(currentTab, currentAction, data.page);
  };

  return (
    <div className="space-y-4">
      {/* Filters and Tabs */}
      <FollowUpsFilter
        currentTab={currentTab}
        onTabChange={handleTabChange}
        counts={data.counts}
        currentAction={currentAction}
        onActionChange={handleActionChange}
      />

      {/* Loading state indicator */}
      {isPending && (
        <div className="text-center py-2 text-xs text-muted-foreground animate-pulse">
          جارٍ تحديث المتابعات...
        </div>
      )}

      {/* Follow-up Cards List */}
      {data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
          {currentTab === "OVERDUE" ? (
            <>
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 mb-3">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                عاش يا بطل! لا توجد أي متابعات متأخرة 🎉
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                أنت ماشي على الجدول بالضبط وكل العملاء بيتم متابعتهم في مواعيدهم.
              </p>
            </>
          ) : currentTab === "TODAY" ? (
            <>
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-600 mb-3">
                <Inbox className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                لا توجد متابعات مجدولة لليوم
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                يمكنك مراجعة قائمة العملاء أو جدولة اتصالات واجتماعات جديدة الآن.
              </p>
              <div className="mt-4">
                <CreateFollowUpDialog clients={clients} onSuccess={handleRefresh} />
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-muted text-muted-foreground mb-3">
                <Inbox className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                لا توجد متابعات في هذا التبويب
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                اضغط على الزر أدناه لجدولة متابعة جديدة مع أحد العملاء.
              </p>
              <div className="mt-4">
                <CreateFollowUpDialog clients={clients} onSuccess={handleRefresh} />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.items.map((item) => (
            <FollowUpCard
              key={item.id}
              followUp={item}
              isOverdue={currentTab === "OVERDUE"}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            صفحة {data.page} من {data.totalPages} (إجمالي {data.total} متابعة)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(currentTab, currentAction, data.page - 1)}
              disabled={data.page <= 1 || isPending}
              className="px-3 py-1 rounded border border-border text-xs disabled:opacity-50 hover:bg-muted"
            >
              السابق
            </button>
            <button
              onClick={() => loadData(currentTab, currentAction, data.page + 1)}
              disabled={data.page >= data.totalPages || isPending}
              className="px-3 py-1 rounded border border-border text-xs disabled:opacity-50 hover:bg-muted"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
