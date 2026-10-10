import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Phone, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "التقويم التجاري | Nile Nexus Sales",
  description: "جدول المواعيد والاجتماعات والعروض التقديمية",
};

interface CalendarItem {
  id: string;
  action: string;
  due_at: string;
  notes: string | null;
  status: string;
  client?: { id: string; name: string } | null;
  deal?: { id: string; title: string } | null;
  assigned_to?: { id: string; full_name: string } | null;
}

export default async function CalendarPage() {
  const t = await getTranslations("calendar");

  const supabase = await createClient();
  const { data: dbFollowUps } = await supabase
    .from("follow_ups")
    .select(`
      id, action, due_at, notes, status,
      client:clients!client_id(id, name),
      deal:deals!deal_id(id, title),
      assigned_to:profiles!assigned_to_id(id, full_name)
    `)
    .eq("status", "PENDING")
    .order("due_at", { ascending: true });

  const items: CalendarItem[] = (dbFollowUps as unknown as CalendarItem[]) || [];

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const nextWeekDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const todayMeetingsCount = items.filter((i) => i.action === "MEETING" && i.due_at.startsWith(todayStr)).length;
  const thisWeekCount = items.filter((i) => new Date(i.due_at) <= nextWeekDate).length;
  const demosCount = items.filter((i) => i.action === "MEETING" || i.action === "ONLINE").length;
  const pendingCallsCount = items.filter((i) => i.action === "CALL").length;

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
          <span>{t("newEvent")}</span>
        </Button>
      </div>

      {/* Calendar Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("todayMeetings")}</span>
          <p className="text-xl font-bold text-[var(--foreground)] mt-1">{todayMeetingsCount} {t("meetingUnit")}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("thisWeekEvents")}</span>
          <p className="text-xl font-bold text-[var(--foreground)] mt-1">{thisWeekCount} {t("appointmentUnit")}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("scheduledDemos")}</span>
          <p className="text-xl font-bold text-[var(--foreground)] mt-1">{demosCount} {t("demoUnit")}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("pendingFollowUps")}</span>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {pendingCallsCount} {t("callUnit")}
          </p>
        </div>
      </div>

      {/* Timeline Agenda View */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {t("upcomingAgenda")}
            </h2>
          </div>
          <span className="text-xs text-[var(--muted-foreground)]">{t("timezone")}</span>
        </div>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-2xl bg-[var(--card)] space-y-3">
              <CalendarIcon className="h-10 w-10 text-[var(--muted-foreground)] mx-auto opacity-40" />
              <h3 className="font-semibold text-base text-[var(--foreground)]">{t("noEvents")}</h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">{t("noEventsDesc")}</p>
            </div>
          ) : (
            items.map((evt) => {
              const due = new Date(evt.due_at);
              const formattedDate = due.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
              const formattedTime = due.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 hover:bg-[var(--accent)] hover:border-[var(--primary)]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base text-[var(--foreground)]">
                        {evt.notes || evt.action}
                      </h3>
                      <Badge variant={evt.action === "MEETING" ? "default" : "secondary"}>
                        {formattedDate}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] flex-wrap">
                      {evt.client && (
                        <span className="font-medium text-[var(--foreground)]">
                          {evt.client.name}
                        </span>
                      )}
                      {evt.deal && <span>{evt.deal.title}</span>}
                      <span className="flex items-center gap-1 text-[var(--primary)] font-mono">
                        <Clock className="h-3 w-3" />
                        {formattedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        {evt.action === "ONLINE" ? (
                          <Video className="h-3 w-3 text-blue-500" />
                        ) : evt.action === "CALL" ? (
                          <Phone className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <MapPin className="h-3 w-3 text-red-500" />
                        )}
                        {evt.action}
                      </span>
                      {evt.assigned_to && (
                        <span className="text-[var(--primary)] font-medium">
                          {evt.assigned_to.full_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button variant="outline" size="sm">
                      {t("details")}
                    </Button>
                    <Button size="sm">
                      {t("checkIn")}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
