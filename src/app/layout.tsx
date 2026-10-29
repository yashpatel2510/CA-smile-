import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClinicThemeProvider } from "@/components/theme/clinic-theme-provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { getClinicBrandingConfig } from "@/lib/clinic-branding-store";

import prisma from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PedioDent Clinic Platform",
  description:
    "Modern pediatric & family dental clinic management and patient booking platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialBranding = getClinicBrandingConfig();
  try {
    const clinic = await prisma.clinic.findFirst();
    if (clinic?.brandingConfig && typeof clinic.brandingConfig === "object") {
      initialBranding = {
        ...initialBranding,
        ...(clinic.brandingConfig as any),
      };
    }
  } catch (err) {
    console.warn("Could not read initial branding from database in RootLayout:", err);
  }

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
