import { Metadata } from "next";
import { TasksClient } from "@/components/tasks/tasks-client";
import { getTasks, getTaskFormData } from "@/lib/actions/tasks";

export const metadata: Metadata = {
  title: "المهام التنفيذية | Tammlo Sales",
  description: "متابعة وإدارة المهام وتكليفات فريق المبيعات والعمليات",
};

export default async function TasksPage() {
  const [tasksResult, formDataResult] = await Promise.all([
    getTasks(),
    getTaskFormData(),
  ]);

  const initialTasks = tasksResult.data?.items || [];
  const initialMetrics = tasksResult.data?.metrics || {
    total: 0,
    urgent: 0,
    inProgress: 0,
    done: 0,
    todo: 0,
  };

  const formData = formDataResult.data || {
    profiles: [],
    clients: [],
    deals: [],
  };

  return (
    <TasksClient
      initialTasks={initialTasks}
      initialMetrics={initialMetrics}
      formData={formData}
    />
  );
}
