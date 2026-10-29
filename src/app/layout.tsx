import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClinicThemeProvider } from "@/components/theme/clinic-theme-provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { getClinicBrandingConfig } from "@/lib/clinic-branding-store";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PedioDent Clinic Platform",
  description:
    "Modern pediatric & family dental clinic management and patient booking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialBranding = getClinicBrandingConfig();

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-brand-background text-brand-text antialiased">
        <ClinicThemeProvider initialBrandConfig={initialBranding}>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </ClinicThemeProvider>
      </body>
    </html>
  );
}
