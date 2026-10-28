import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tammlo Sales | تامللو للمبيعات",
    short_name: "Tammlo",
    description: "نظام إدارة المبيعات والصفقات وعروض الأسعار المتكامل لشركة تامللو - Tammlo Sales CRM",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0B132B",
    theme_color: "#2563EB",
    orientation: "any",
    dir: "rtl",
    lang: "ar",
    categories: ["business", "productivity", "finance"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
