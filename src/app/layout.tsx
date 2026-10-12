import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { localeDirection, type Locale } from "@/i18n/config";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Nile Nexus Sales | نايل نيكسس للمبيعات",
  description: "نظام إدارة المبيعات والصفقات وعروض الأسعار المتكامل لشركة نايل نيكسس",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nile Nexus",
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const dir = localeDirection[locale];
  const fontFamily =
    locale === "ar"
      ? "'Cairo', 'Inter', sans-serif"
      : "'Inter', 'Cairo', sans-serif";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body style={{ fontFamily }} className="antialiased min-h-screen">
        <ThemeProvider defaultTheme="light">
          <NextIntlClientProvider messages={messages}>
            <ServiceWorkerRegister />
            {children}
            <Toaster
              position={dir === "rtl" ? "top-left" : "top-right"}
              richColors
              closeButton
              dir={dir}
            />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
