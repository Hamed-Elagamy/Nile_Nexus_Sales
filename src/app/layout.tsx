import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { localeDirection, type Locale } from "@/i18n/config";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nile Nexus Sales",
  description: "Internal Sales Management Platform — Nile Nexus",
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
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body style={{ fontFamily }} className="antialiased min-h-screen">
        <ThemeProvider defaultTheme="light">
          <NextIntlClientProvider messages={messages}>
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
