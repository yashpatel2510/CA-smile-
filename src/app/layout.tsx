import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#042f2e" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("127.0.0.1") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("vercel.app")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://www.casmiledentalclinic.com"
  ),
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google:
            process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
            process.env.GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  title: {
    default: "Best Dental Clinic in Bilimora | CA Smile Dental Clinic",
    template: "%s",
  },
  description:
    "Looking for the best dentist in Bilimora? Visit CA Smile Dental Clinic by Dr. Deep Patel for painless root canal treatment, dental implants, teeth whitening, invisible braces & smile designing. Book an appointment today.",
  keywords: [
    "best dental clinic in bilimora",
    "dentist in bilimora",
    "dental clinic in bilimora",
    "ca smile dental clinic",
    "dr deep patel dentist",
    "dental implants bilimora",
    "root canal treatment bilimora",
    "teeth whitening in bilimora",
    "braces and clear aligners bilimora",
    "dentist near me bilimora",
    "emergency dentist bilimora",
    "painless dental clinic bilimora",
    "dental hospital bilimora",
    "dental clinic navsari gujarat",
  ],
  authors: [{ name: "Dr. Deep Patel", url: "https://www.casmiledentalclinic.com" }],
  creator: "Dr. Deep Patel",
  publisher: "CA Smile Dental Clinic",
  category: "Healthcare & Dental Clinic",
  openGraph: {
    title: "Best Dental Clinic in Bilimora | CA Smile Dental Clinic",
    description:
      "Looking for the best dentist in Bilimora? Visit CA Smile Dental Clinic by Dr. Deep Patel for painless root canal treatment, dental implants, teeth whitening, invisible braces & smile designing.",
    url: "https://www.casmiledentalclinic.com",
    siteName: "CA Smile Dental Clinic",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/ca-smile-clinic-building.jpg",
        width: 1200,
        height: 630,
        alt: "CA Smile Dental Clinic Bilimora - Dr. Deep Patel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Dental Clinic in Bilimora | CA Smile Dental Clinic",
    description:
      "Looking for the best dentist in Bilimora? Visit CA Smile Dental Clinic for dental implants, root canals, and smile designing.",
    images: ["/images/ca-smile-clinic-building.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "IN-GJ",
    "geo.placename": "Bilimora, Gujarat, India",
    "geo.position": "20.7636;72.9680",
    "ICBM": "20.7636, 72.9680",
  },
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
  const heroDesktop = initialBranding?.hero?.imageUrl;
  const heroMobile = initialBranding?.hero?.mobileImageUrl || heroDesktop;

  const toWebpUrl = (url?: string) => {
    if (!url) return "";
    if (url.endsWith(".jpeg")) return url.replace(".jpeg", ".webp");
    if (url.endsWith(".jpg")) return url.replace(".jpg", ".webp");
    if (url.endsWith(".png")) return url.replace(".png", ".webp");
    return url;
  };

  const desktopWebp = toWebpUrl(heroDesktop);
  const mobileWebp = toWebpUrl(heroMobile);

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Responsive hero image preloading: mobile devices NEVER download desktop hero */}
        {mobileWebp && (
          <link
            rel="preload"
            as="image"
            type="image/webp"
            href={mobileWebp}
            media="(max-width: 767px)"
            fetchPriority="high"
          />
        )}
        {desktopWebp && (
          <link
            rel="preload"
            as="image"
            type="image/webp"
            href={desktopWebp}
            media="(min-width: 768px)"
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
