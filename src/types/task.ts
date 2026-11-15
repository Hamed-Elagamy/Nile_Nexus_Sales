import type { Task, TaskPriority, TaskStatus } from "./domain";

export interface TaskWithRelations extends Task {
  assignee?: { id: string; full_name: string; role?: string } | null;
  client?: { id: string; name: string } | null;
  deal?: { id: string; title: string } | null;
  creator?: { id: string; full_name: string } | null;
}

export interface TaskMetrics {
  total: number;
  urgent: number;
  inProgress: number;
  done: number;
  todo: number;
}

export interface TasksListResult {
  items: TaskWithRelations[];
  metrics: TaskMetrics;
}

export interface TaskFormData {
  profiles: Array<{ id: string; full_name: string; role: string }>;
  clients: Array<{ id: string; name: string }>;
  deals: Array<{ id: string; title: string }>;
  currentUserId?: string;
}
