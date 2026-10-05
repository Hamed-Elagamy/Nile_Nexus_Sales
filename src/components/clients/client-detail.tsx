"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Briefcase,
  Save,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClientTypeBadge } from "./client-type-badge";
import { ContactsList } from "./contacts-list";
import { updateClient, type ClientWithRelations } from "@/lib/actions/clients";

interface ClientDetailProps {
  client: ClientWithRelations;
}

export function ClientDetail({ client }: ClientDetailProps) {
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"contacts" | "deals" | "info">("contacts");
  const [isPending, startTransition] = useTransition();

  // Editable fields
  const [name, setName] = useState(client.name);
  const [area, setArea] = useState(client.area || "");
  const [industry, setIndustry] = useState(client.industry || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [email, setEmail] = useState(client.email || "");
  const [website, setWebsite] = useState(client.website || "");
  const [address, setAddress] = useState(client.address || "");
  const [notes, setNotes] = useState(client.notes || "");

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}`
    : null;

  const handleSaveInfo = () => {
    startTransition(async () => {
      const res = await updateClient(client.id, {
        name,
        area: area || null,
        industry: industry || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        address: address || null,
        notes: notes || null,
      });

      if (res.success) {
        toast.success("تم حفظ تعديلات العميل بنجاح! 👏");
        router.refresh();
      } else {
        toast.error(res.error || tCommon("error"));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>الرجوع لدليل العملاء</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {client.business_id}
            </span>
            <ClientTypeBadge type={client.type} />
          </div>
          {client.industry && (
            <p className="text-sm text-muted-foreground">{client.industry}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>اتصال</span>
            </a>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>واتساب</span>
            </a>
          )}

          <Link
            href={`/deals/new?client_id=${client.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-95 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>صفقة جديدة</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "contacts"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          جهات الاتصال ({client.contacts?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("deals")}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "deals"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          الصفقات ({client.deals?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("info")}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "info"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          بيانات العميل
        </button>
      </div>

      {/* Tab 1: Contacts */}
      {activeTab === "contacts" && (
        <ContactsList
          clientId={client.id}
          contacts={client.contacts || []}
          onRefresh={() => router.refresh()}
        />
      )}

      {/* Tab 2: Deals */}
      {activeTab === "deals" && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">الصفقات المرتبطة</CardTitle>
            <Link
              href={`/deals/new?client_id=${client.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>إنشاء صفقة للعميل</span>
            </Link>
          </CardHeader>
          <CardContent>
            {(!client.deals || client.deals.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
                <Briefcase className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p>لا توجد صفقات مفتوحة لهذا العميل بعد</p>
              </div>
            ) : (
              <div className="space-y-2">
                {client.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3 rounded-lg border border-border flex items-center justify-between hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        {deal.business_id}
                      </span>
                      <Link
                        href={`/deals/${deal.id}`}
                        className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
                      >
                        {deal.title}
                      </Link>
                    </div>
                    <div className="text-end">
                      <span className="text-xs font-semibold block">
                        {deal.estimated_value ? `${deal.estimated_value} ${deal.currency}` : "-"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {deal.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Client Info */}
      {activeTab === "info" && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">تعديل بيانات العميل</CardTitle>
            <Button
              size="sm"
              onClick={handleSaveInfo}
              disabled={isPending}
              className="gap-1.5 text-xs"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>حفظ التعديلات</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">اسم العميل</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">المجال / النشاط</label>
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">رقم الهاتف</label>
                <Input value={phone} dir="ltr" onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">البريد الإلكتروني</label>
                <Input value={email} dir="ltr" onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">المنطقة</label>
                <Input value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">الموقع الإلكتروني</label>
                <Input value={website} dir="ltr" onChange={(e) => setWebsite(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">العنوان التفصيلي</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">ملاحظات عامة</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
