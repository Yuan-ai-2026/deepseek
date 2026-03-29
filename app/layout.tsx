import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 交易仪表盘",
  description: "由 DeepSeek 驱动的 AI 交易分析仪表盘",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
