import { Metadata } from "next";
import { CheckSquare, Plus, Clock, AlertCircle } from "lucide-react";
import { demoTasks, demoProfiles, demoClients, demoDeals } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "المهام التنفيذية | Nile Nexus Sales",
  description: "متابعة وإدارة المهام وتكليفات فريق المبيعات",
};

export default function TasksPage() {
  const tasks = demoTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            المهام التنفيذية
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            متابعة المهام التشغيلية، الإجراءات المطلوبة، والتوثيق القانوني للصفقات
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>مهمة جديدة</span>
        </Button>
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--muted-foreground)]">إجمالي المهام</span>
            <CheckSquare className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-2">{tasks.length}</p>
        </div>

        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-700 dark:text-red-300">مهام عاجلة</span>
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-2">
            {tasks.filter((t) => t.priority === "URGENT").length}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--muted-foreground)]">قيد التنفيذ</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-2">
            {tasks.filter((t) => t.status === "IN_PROGRESS").length}
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
                    {task.priority === "URGENT"
                      ? "عاجل"
                      : task.priority === "IMPORTANT"
                      ? "هام"
                      : "عادي"}
                  </Badge>
                  <Badge variant="outline">
                    {task.status === "IN_PROGRESS"
                      ? "قيد التنفيذ"
                      : task.status === "DONE"
                      ? "مكتملة"
                      : "في الانتظار"}
                  </Badge>
                </div>

                {task.notes && (
                  <p className="text-sm text-[var(--muted-foreground)]">{task.notes}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] flex-wrap pt-1">
                  {client && <span>العميل: {client.name}</span>}
                  {deal && <span>الصفقة: {deal.title}</span>}
                  {task.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      الموعد: {new Date(task.deadline).toLocaleDateString("ar-EG")}
                    </span>
                  )}
                  {assignee && (
                    <span className="text-[var(--primary)] font-medium">
                      المسؤول: {assignee.full_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Button variant="outline" size="sm">
                  تفاصيل
                </Button>
                <Button size="sm">
                  إنجاز المهمة
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
