import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";

// Main sans font
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "汉字字帖生成器 | Chinese Character Worksheet Generator",
  description:
    "生成田字格、米字格字帖，支持拼音标注、笔画顺序、部首显示。可导出PDF打印。",
  keywords: [
    "字帖",
    "田字格",
    "米字格",
    "汉字练习",
    "拼音",
    "笔画",
    "Chinese worksheet",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSansSC.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
