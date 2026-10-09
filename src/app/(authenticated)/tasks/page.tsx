import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckSquare, Plus, Clock, AlertCircle } from "lucide-react";
import { demoTasks, demoProfiles, demoClients, demoDeals } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "المهام التنفيذية | Nile Nexus Sales",
  description: "متابعة وإدارة المهام وتكليفات فريق المبيعات",
};

export default async function TasksPage() {
  const t = await getTranslations("tasks");
  const tCommon = await getTranslations("common");
  const tasks = demoTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>{t("addNew")}</span>
        </Button>
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--muted-foreground)]">{t("totalTasks")}</span>
            <CheckSquare className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-2">{tasks.length}</p>
        </div>

        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-700 dark:text-red-300">{t("urgentTasks")}</span>
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-2">
            {tasks.filter((tItem) => tItem.priority === "URGENT").length}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--muted-foreground)]">{t("inProgressTasks")}</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-2">
            {tasks.filter((tItem) => tItem.status === "IN_PROGRESS").length}
          </p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const assignee = demoProfiles.find((p) => p.id === task.assignee_id);
          const client = demoClients.find((c) => c.id === task.client_id);
          const deal = demoDeals.find((d) => d.id === task.deal_id);

          return (
            <div
              key={task.id}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base text-[var(--foreground)]">
                    {task.title}
                  </h3>
                  <Badge
                    variant={
                      task.priority === "URGENT"
                        ? "destructive"
                        : task.priority === "IMPORTANT"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {t(`priority.${task.priority}` as any)}
                  </Badge>
                  <Badge variant="outline">
                    {t(`status.${task.status}` as any)}
                  </Badge>
                </div>

                {task.notes && (
                  <p className="text-sm text-[var(--muted-foreground)]">{task.notes}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] flex-wrap pt-1">
                  {client && <span>{t("client")}: {client.name}</span>}
                  {deal && <span>{t("deal")}: {deal.title}</span>}
                  {task.deadline && (
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {t("dueDate")}: {new Date(task.deadline).toISOString().split("T")[0]}
                    </span>
                  )}
                  {assignee && (
                    <span className="text-[var(--primary)] font-medium">
                      {t("assignedTo")}: {assignee.full_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Button variant="outline" size="sm">
                  {tCommon("details")}
                </Button>
                <Button size="sm">
                  {t("completedTasks")}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
