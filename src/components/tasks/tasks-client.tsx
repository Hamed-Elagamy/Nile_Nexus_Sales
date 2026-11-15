"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TasksFilterBar } from "./tasks-filter-bar";
import { TaskCard } from "./task-card";
import { CreateTaskDialog } from "./create-task-dialog";
import { EditTaskDialog } from "./edit-task-dialog";
import { TaskDetailsDialog } from "./task-details-dialog";
import { updateTaskStatus, deleteTask, getTasks } from "@/lib/actions/tasks";
import type { TaskWithRelations, TaskMetrics, TaskFormData } from "@/types/task";
import type { TaskStatus } from "@/types/domain";

interface TasksClientProps {
  initialTasks: TaskWithRelations[];
  initialMetrics: TaskMetrics;
  formData: TaskFormData;
}

export function TasksClient({
  initialTasks,
  initialMetrics,
  formData,
}: TasksClientProps) {
  const t = useTranslations("tasks");
  const [isPending, startTransition] = useTransition();

  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks);
  const [metrics, setMetrics] = useState<TaskMetrics>(initialMetrics);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [detailsTask, setDetailsTask] = useState<TaskWithRelations | null>(null);

  // Recalculate metrics locally on state change
  const currentMetrics = useMemo(() => {
    return {
      total: tasks.length,
      urgent: tasks.filter(
        (t) => t.priority === "URGENT" && t.status !== "DONE" && t.status !== "CANCELLED"
      ).length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: tasks.filter((t) => t.status === "DONE").length,
      todo: tasks.filter((t) => t.status === "TODO").length,
    };
  }, [tasks]);

  // Filter tasks based on search, status tab, and priority
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Status Tab filter
    if (statusFilter === "URGENT") {
      result = result.filter(
        (t) => t.priority === "URGENT" && t.status !== "DONE" && t.status !== "CANCELLED"
      );
    } else if (statusFilter !== "ALL") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority filter dropdown
    if (priorityFilter !== "ALL") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.assignee?.full_name && t.assignee.full_name.toLowerCase().includes(q)) ||
          (t.client?.name && t.client.name.toLowerCase().includes(q)) ||
          (t.deal?.title && t.deal.title.toLowerCase().includes(q))
      );
    }

    return result;
  }, [tasks, statusFilter, priorityFilter, search]);

  // Fast toggle / change status
  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    startTransition(async () => {
      const res = await updateTaskStatus({ id, status: newStatus });
      if (res.success) {
        toast.success(t("messages.statusSuccess"));
      } else {
        toast.error(res.error || t("messages.error"));
        // Re-fetch on failure to sync
        const fresh = await getTasks();
        if (fresh.success && fresh.data) {
          setTasks(fresh.data.items);
          setMetrics(fresh.data.metrics);
        }
      }
    });
  };

  // Delete task
  const handleDelete = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    if (!window.confirm(`هل أنت متأكد من حذف المهمة: "${target.title}"؟`)) {
      return;
    }

    // Optimistic remove
    setTasks((prev) => prev.filter((t) => t.id !== id));

    startTransition(async () => {
      const res = await deleteTask(id);
      if (res.success) {
        toast.success(t("messages.deleteSuccess"));
      } else {
        toast.error(res.error || t("messages.error"));
        const fresh = await getTasks();
        if (fresh.success && fresh.data) {
          setTasks(fresh.data.items);
          setMetrics(fresh.data.metrics);
        }
      }
    });
  };

  // On Task Created
  const handleTaskCreated = (newTask: TaskWithRelations) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // On Task Updated
  const handleTaskUpdated = (updatedTask: TaskWithRelations) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {currentMetrics.total} مهمة
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("subtitle")}
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 shrink-0 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>{t("addNew")}</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "ALL"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-border bg-card hover:border-primary/40 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t("totalTasks")}
            </span>
            <CheckSquare className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {currentMetrics.total}
          </p>
        </div>

        {/* Urgent Tasks */}
        <div
          onClick={() => setStatusFilter("URGENT")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "URGENT"
              ? "border-red-400 bg-red-100/50 dark:bg-red-950/40 shadow-xs"
              : "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 hover:border-red-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">
              {t("urgentTasks")}
            </span>
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-2">
            {currentMetrics.urgent}
          </p>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "IN_PROGRESS"
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40 shadow-xs"
              : "border-border bg-card hover:border-blue-400/50 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t("inProgressTasks")}
            </span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {currentMetrics.inProgress}
          </p>
        </div>

        {/* Completed */}
        <div
          onClick={() => setStatusFilter("DONE")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "DONE"
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 shadow-xs"
              : "border-border bg-card hover:border-emerald-400/50 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t("completedTasks")}
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {currentMetrics.done}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <TasksFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        counts={currentMetrics}
      />

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-2xl bg-card space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-foreground">
                {t("noTasks")}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {t("noTasksDesc")}
              </p>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>{t("addNew")}</span>
            </Button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(tItem) => setEditingTask(tItem)}
              onViewDetails={(tItem) => setDetailsTask(tItem)}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        formData={formData}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleTaskCreated}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        formData={formData}
        open={!!editingTask}
        onOpenChange={(isOpen) => !isOpen && setEditingTask(null)}
        onSuccess={handleTaskUpdated}
      />

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={detailsTask}
        open={!!detailsTask}
        onOpenChange={(isOpen) => !isOpen && setDetailsTask(null)}
        onEdit={(tItem) => {
          setDetailsTask(null);
          setEditingTask(tItem);
        }}
        onToggleStatus={(tItem) => {
          const nextStatus: TaskStatus = tItem.status === "DONE" ? "TODO" : "DONE";
          handleStatusChange(tItem.id, nextStatus);
        }}
      />
    </div>
  );
}
