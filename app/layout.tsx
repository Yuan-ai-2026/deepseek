import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI仪表盘',
  description: 'AI-powered trading analysis dashboard',
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
