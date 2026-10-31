import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClinicThemeProvider } from "@/components/theme/clinic-theme-provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
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
        url: "/favicon-light.png?v=ca3",
        media: "(prefers-color-scheme: light)",
        type: "image/png",
      },
      {
        url: "/favicon-dark.png?v=ca3",
        media: "(prefers-color-scheme: dark)",
        type: "image/png",
      },
      {
        url: "/favicon.ico?v=ca3",
        sizes: "any",
      },
    ],
    shortcut: "/favicon.ico?v=ca3",
    apple: [
      { url: "/apple-icon.png?v=ca3", sizes: "180x180", type: "image/png" },
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
        {/* Dynamic theme favicons: White tooth on dark tabs, Black tooth on light tabs */}
        <link
          rel="icon"
          href="/favicon-light.png?v=ca3"
          media="(prefers-color-scheme: light)"
          type="image/png"
        />
        <link
          rel="icon"
          href="/favicon-dark.png?v=ca3"
          media="(prefers-color-scheme: dark)"
          type="image/png"
        />
        <link rel="icon" href="/favicon.ico?v=ca3" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=ca3" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=ca3" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function applyDynamicFavicon() {
                  try {
                    var isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var iconUrl = isDark ? '/favicon-dark.png?v=ca3' : '/favicon-light.png?v=ca3';
                    
                    var links = document.querySelectorAll("link[rel*='icon']");
                    links.forEach(function(el) {
                      if (el.parentNode) el.parentNode.removeChild(el);
                    });
                    
                    var newIcon = document.createElement('link');
                    newIcon.rel = 'icon';
                    newIcon.type = 'image/png';
                    newIcon.href = iconUrl;
                    document.head.appendChild(newIcon);

                    var newShortcut = document.createElement('link');
                    newShortcut.rel = 'shortcut icon';
                    newShortcut.type = 'image/png';
                    newShortcut.href = iconUrl;
                    document.head.appendChild(newShortcut);
                  } catch (e) {}
                }
                applyDynamicFavicon();
                if (window.matchMedia) {
                  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyDynamicFavicon);
                }
              })();
            `,
          }}
        />
        {heroImg && (
          <link
            rel="preload"
            as="image"
            href={heroImg}
            fetchPriority="high"
          />
        )}
      </head>
      <body className="min-h-screen bg-brand-background text-brand-text antialiased">
        <ClinicThemeProvider initialBrandConfig={initialBranding}>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </ClinicThemeProvider>
      </body>
    </html>
  );
}
