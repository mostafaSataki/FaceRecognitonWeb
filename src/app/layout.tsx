import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "سیستم تشخیص چهره - سیستم امنیتی هوشمند",
  description: "سیستم تشخیص چهره و امنیتی هوشمند با قابلیت‌های پیشرفته شناسایی و مدیریت",
  keywords: ["تشخیص چهره", "سیستم امنیتی", "هوش مصنوعی", "دوربین مداربسته", "Next.js", "TypeScript"],
  authors: [{ name: "تیم توسعه" }],
  openGraph: {
    title: "سیستم تشخیص چهره هوشمند",
    description: "سیستم امنیتی هوشمند با قابلیت تشخیص چهره",
    url: "https://example.com",
    siteName: "سیستم امنیتی",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "سیستم تشخیص چهره هوشمند",
    description: "سیستم امنیتی هوشمند با قابلیت تشخیص چهره",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
