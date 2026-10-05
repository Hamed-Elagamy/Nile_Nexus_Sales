"use client";

import React from "react";
import { Phone, MessageCircle, Mail, Star, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddContactDialog } from "./add-contact-dialog";
import type { Contact } from "@/types/domain";

interface ContactsListProps {
  clientId: string;
  contacts: Contact[];
  onRefresh?: () => void;
}

export function ContactsList({ clientId, contacts, onRefresh }: ContactsListProps) {
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-bold">جهات الاتصال</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {contacts.length}
          </Badge>
        </div>
        <AddContactDialog clientId={clientId} onSuccess={onRefresh} />
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs space-y-2">
            <User className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p>لا توجد جهات اتصال مسجلة بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contacts.map((contact) => {
              const cleanPhone = (contact.whatsapp || contact.phone)?.replace(/[^0-9]/g, "");
              const whatsappUrl = cleanPhone
                ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}`
                : null;

              return (
                <div
                  key={contact.id}
                  className={`p-3 rounded-xl border transition-all ${
                    contact.is_primary
                      ? "border-primary/40 bg-primary/5 shadow-2xs"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {contact.name}
                        </span>
                        {contact.is_primary && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-primary/10 text-primary border-primary/20 gap-1"
                          >
                            <Star className="h-2.5 w-2.5 fill-primary" />
                            <span>أساسي</span>
                          </Badge>
                        )}
                      </div>
                      {contact.job_title && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {contact.job_title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Channels */}
                  <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 text-xs flex items-center gap-1"
                          title="اتصال"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span dir="ltr" className="font-mono text-[11px]">
                            {contact.phone}
                          </span>
                        </a>
                      )}

                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs flex items-center gap-1"
                          title="واتساب"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 text-xs flex items-center gap-1"
                          title="إيميل"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
