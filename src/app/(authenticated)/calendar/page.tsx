import { Metadata } from "next";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Phone, Plus } from "lucide-react";
import { demoFollowUps } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "التقويم التجاري | Nile Nexus Sales",
  description: "جدول المواعيد والاجتماعات والعروض التقديمية",
};

export default function CalendarPage() {
  const events = [
    {
      id: "evt-01",
      title: "اجتماع عرض تجريبي مباشر (Demo Presentation)",
      clientName: "شركة النيل للمقاولات والتجارة",
      dealTitle: "ميكنة إدارة المبيعات لشركة النيل للمقاولات",
      date: "اليوم",
      time: "02:00 م - 03:30 م",
      type: "MEETING",
      location: "مقر الشركة - مصر الجديدة",
      rep: "كريم فهمي",
    },
    {
      id: "evt-02",
      title: "مكالمة هاتفية لمراجعة شروط الدفع والخصم",
      clientName: "تبارك للاستثمار والتطوير العقاري",
      dealTitle: "باقة المنصة السحابية المتكاملة",
      date: "غداً",
      time: "11:00 ص - 11:30 ص",
      type: "CALL",
      location: "مكالمة هاتفية مباشرة",
      rep: "كريم فهمي",
    },
    {
      id: "evt-03",
      title: "جلسة نقاش فني وتقني عبر زووم",
      clientName: "تكنو سوفت مصر للحلول الرقمية",
      dealTitle: "استشارات تكامل العمليات",
      date: "الخميس القادم",
      time: "01:00 م - 02:00 م",
      type: "ONLINE",
      location: "Zoom Cloud Meeting",
      rep: "مصطفى كمال",
    },
    {
      id: "evt-04",
      title: "زيارة ميدانية لمصنع العاشر من رمضان",
      clientName: "القاهرة للصناعات الغذائية والتعبئة",
      dealTitle: "نظام إدارة الموزعين ومندوبي التوزيع",
      date: "الأسبوع القادم",
      time: "10:00 ص - 01:00 م",
      type: "VISIT",
      location: "المنطقة الصناعية الأولى، العاشر من رمضان",
      rep: "مصطفى كمال",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            التقويم التجاري
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            جدول المقابلات الميدانية، الاجتماعات الافتراضية، ومواعيد إغلاق الصفقات
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>موعد جديد</span>
        </Button>
      </div>

      {/* Calendar Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">اجتماعات اليوم</span>
          <p className="text-xl font-bold text-[var(--foreground)] mt-1">1 اجتماع</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">مواعيد هذا الأسبوع</span>
          <p className="text-xl font-bold text-[var(--foreground)] mt-1">3 مواعيد</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">عروض تقديمية مجدولة</span>
          <p className="text-xl font-bold text-[var(--foreground)] mt-1">2 عرض فني</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">متابعات هاتفية معلقة</span>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {demoFollowUps.filter((f) => f.status === "PENDING").length} مكالمة
          </p>
        </div>
      </div>

      {/* Timeline Agenda View */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              أجندة المواعيد القادمة
            </h2>
          </div>
          <span className="text-xs text-[var(--muted-foreground)]">توقيت القاهرة (GMT+2)</span>
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
                    العميل: {evt.clientName}
                  </span>
                  <span>الصفقة: {evt.dealTitle}</span>
                  <span className="flex items-center gap-1 text-[var(--primary)]">
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
                  تفاصيل الموعد
                </Button>
                <Button size="sm">
                  تسجيل المحضر
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
