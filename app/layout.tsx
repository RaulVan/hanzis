import type { Metadata, Viewport } from "next";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/600.css";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/600.css";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { AppProviders } from "@/components/layout/AppProviders";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "汉字网 Hanzis · 中文学习与字帖生成", template: `%s | ${SITE_NAME}` },
  description: "从一笔一画开始。免费生成可打印的汉字字帖，学习拼音、汉字笔顺与古诗词，查询汉字和词语。无需注册。",
  keywords: ["字帖", "田字格", "米字格", "汉字练习", "拼音学习", "笔顺", "古诗词", "中文字典"],
  openGraph: { siteName: "汉字网 Hanzis", locale: "zh_CN", type: "website", title: "汉字网 Hanzis", description: "从一笔一画开始，让汉字学习成为日常。" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F8F7F4" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <a href="#main-content" className="skip-link">跳到主要内容</a>
        <Navigation />
        <main id="main-content" tabIndex={-1} className="site-container main-content">{children}</main>
        <Footer />
        <AppProviders />
      </body>
    </html>
  );
}
