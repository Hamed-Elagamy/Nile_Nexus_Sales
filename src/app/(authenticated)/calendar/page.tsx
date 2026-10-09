import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Phone, Plus } from "lucide-react";
import { demoFollowUps } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "التقويم التجاري | Nile Nexus Sales",
  description: "جدول المواعيد والاجتماعات والعروض التقديمية",
};

export default async function CalendarPage() {
  const t = await getTranslations("calendar");

  const events = [
    {
      id: "evt-01",
      title: t("events.e1Title"),
      clientName: t("events.e1Client"),
      dealTitle: t("events.e1Deal"),
      date: t("today"),
      time: "02:00 - 03:30",
      type: "MEETING",
      location: t("events.e1Loc"),
      rep: "Karim Fahmy",
    },
    {
      id: "evt-02",
      title: t("events.e2Title"),
      clientName: t("events.e2Client"),
      dealTitle: t("events.e2Deal"),
      date: t("tomorrow"),
      time: "11:00 - 11:30",
      type: "CALL",
      location: t("events.e2Loc"),
      rep: "Karim Fahmy",
    },
    {
      id: "evt-03",
      title: t("events.e3Title"),
      clientName: t("events.e3Client"),
      dealTitle: t("events.e3Deal"),
      date: t("nextThursday"),
      time: "01:00 - 02:00",
      type: "ONLINE",
      location: t("events.e3Loc"),
      rep: "Mostafa Kamal",
    },
    {
      id: "evt-04",
      title: t("events.e4Title"),
      clientName: t("events.e4Client"),
      dealTitle: t("events.e4Deal"),
      date: t("nextWeek"),
      time: "10:00 - 01:00",
      type: "VISIT",
      location: t("events.e4Loc"),
      rep: "Mostafa Kamal",
    },
  ];

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
          <p className="text-xl font-bold text-[var(--foreground)] mt-1">1 {t("meetingUnit")}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("thisWeekEvents")}</span>
          <p className="text-xl font-bold text-[var(--foreground)] mt-1">3 {t("appointmentUnit")}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("scheduledDemos")}</span>
          <p className="text-xl font-bold text-[var(--foreground)] mt-1">2 {t("demoUnit")}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("pendingFollowUps")}</span>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {demoFollowUps.filter((f) => f.status === "PENDING").length} {t("callUnit")}
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
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 hover:bg-[var(--accent)] hover:border-[var(--primary)]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base text-[var(--foreground)]">
                    {evt.title}
                  </h3>
                  <Badge variant={evt.type === "MEETING" ? "default" : "secondary"}>
                    {evt.date}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] flex-wrap">
                  <span className="font-medium text-[var(--foreground)]">
                    {evt.clientName}
                  </span>
                  <span>{evt.dealTitle}</span>
                  <span className="flex items-center gap-1 text-[var(--primary)] font-mono">
                    <Clock className="h-3 w-3" />
                    {evt.time}
                  </span>
                  <span className="flex items-center gap-1">
                    {evt.type === "ONLINE" ? (
                      <Video className="h-3 w-3 text-blue-500" />
                    ) : evt.type === "CALL" ? (
                      <Phone className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <MapPin className="h-3 w-3 text-red-500" />
                    )}
                    {evt.location}
                  </span>
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
          ))}
        </div>
      </div>
    </div>
  );
}
