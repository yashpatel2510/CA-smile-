import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClinicThemeProvider } from "@/components/theme/clinic-theme-provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { FaviconSwitcher } from "@/components/theme/favicon-switcher";
import { getClinicBrandingConfig } from "@/lib/clinic-branding-store";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CA Smile Dental Clinic",
    template: "%s | CA Smile Dental Clinic",
  },
  description:
    "CA Smile Multispeciality Dental Clinic - Painless single-visit endodontics, digital smile designing, dental implants, and modern family dental care in Bilimora.",
  icons: {
    icon: [
      {
        url: "/favicon.svg?v=ca5",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-dark.png?v=ca5",
        media: "(prefers-color-scheme: dark)",
        type: "image/png",
      },
      {
        url: "/favicon-light.png?v=ca5",
        media: "(prefers-color-scheme: light)",
        type: "image/png",
      },
      {
        url: "/favicon-dark.ico?v=ca5",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon-light.ico?v=ca5",
        media: "(prefers-color-scheme: light)",
      },
    ],
    shortcut: "/favicon.svg?v=ca5",
    apple: [
      { url: "/apple-icon.png?v=ca5", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialBranding = getClinicBrandingConfig();
  const heroImg = initialBranding?.hero?.imageUrl;

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preload critical hero image for instant LCP render */}
        {heroImg && (
          <link
            rel="preload"
            as="image"
            href={heroImg}
            fetchPriority="high"
          />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
      </head>
      <body className="min-h-screen bg-brand-background text-brand-text antialiased">
        <ClinicThemeProvider initialBrandConfig={initialBranding}>
          <FaviconSwitcher />
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </ClinicThemeProvider>
      </body>
    </html>
  );
}
