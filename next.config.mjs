/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "clsx", "tailwind-merge"],
  },
  async redirects() {
    return [
      // 301 Permanent Redirects: Legitimate Dental Treatment Pages only
      {
        source: "/services/root-canal-treatment",
        destination: "/treatments/root-canal-treatment",
        permanent: true,
      },
      {
        source: "/services/dental-implants",
        destination: "/treatments/dental-implants",
        permanent: true,
      },
      {
        source: "/services/digital-smile-design",
        destination: "/treatments/digital-smile-design",
        permanent: true,
      },
      {
        source: "/services/teeth-whitening",
        destination: "/treatments/teeth-whitening",
        permanent: true,
      },
      {
        source: "/services/clear-aligners",
        destination: "/treatments/orthodontics",
        permanent: true,
      },
      {
        source: "/services/teeth-cleaning-scaling",
        destination: "/treatments/gum-treatment",
        permanent: true,
      },
      {
        source: "/services/pediatric-dentistry",
        destination: "/treatments/children-dentistry",
        permanent: true,
      },
      {
        source: "/services/dental-consultation",
        destination: "/treatments/dental-consultation",
        permanent: true,
      },
      {
        source: "/services/full-mouth-rehabilitation",
        destination: "/treatments/full-mouth-rehabilitation",
        permanent: true,
      },
      {
        source: "/services/dental-crowns-and-bridges",
        destination: "/treatments/dental-crowns-and-bridges",
        permanent: true,
      },
      {
        source: "/services/wisdom-tooth-removal",
        destination: "/treatments/wisdom-tooth-removal",
        permanent: true,
      },
      {
        source: "/services/gum-treatment",
        destination: "/treatments/gum-treatment",
        permanent: true,
      },
      {
        source: "/services/orthodontics",
        destination: "/treatments/orthodontics",
        permanent: true,
      },
      {
        source: "/services/restorative-dentistry",
        destination: "/treatments/restorative-dentistry",
        permanent: true,
      },
      {
        source: "/services/children-dentistry",
        destination: "/treatments/children-dentistry",
        permanent: true,
      },
      {
        source: "/services/porcelain-veneers",
        destination: "/treatments/porcelain-veneers",
        permanent: true,
      },
      {
        source: "/services/dentures",
        destination: "/treatments/dentures",
        permanent: true,
      },
      // Synonymous aliases under /treatments to enforce single canonical URLs
      {
        source: "/treatments/clear-aligners",
        destination: "/treatments/orthodontics",
        permanent: true,
      },
      {
        source: "/treatments/teeth-cleaning-scaling",
        destination: "/treatments/gum-treatment",
        permanent: true,
      },
      {
        source: "/treatments/pediatric-dentistry",
        destination: "/treatments/children-dentistry",
        permanent: true,
      },
      // Root treatments catalog redirects to /services catalog
      {
        source: "/treatments",
        destination: "/services",
        permanent: true,
      },
      // Suggested Geo-targeted Local SEO Treatment URLs (Permanent 301 Redirect to Canonical Treatment Pages)
      {
        source: "/dental-implants-bilimora",
        destination: "/treatments/dental-implants",
        permanent: true,
      },
      {
        source: "/root-canal-treatment-bilimora",
        destination: "/treatments/root-canal-treatment",
        permanent: true,
      },
      {
        source: "/braces-treatment-bilimora",
        destination: "/treatments/orthodontics",
        permanent: true,
      },
      {
        source: "/teeth-whitening-bilimora",
        destination: "/treatments/teeth-whitening",
        permanent: true,
      },
      {
        source: "/smile-designing-bilimora",
        destination: "/treatments/digital-smile-design",
        permanent: true,
      },
      {
        source: "/wisdom-tooth-removal-bilimora",
        destination: "/treatments/wisdom-tooth-removal",
        permanent: true,
      },
      {
        source: "/dental-crowns-bilimora",
        destination: "/treatments/dental-crowns-and-bridges",
        permanent: true,
      },
      // Additional Bilimora short aliases & /treatments/ subpath variations
      {
        source: "/braces-bilimora",
        destination: "/treatments/orthodontics",
        permanent: true,
      },
      {
        source: "/smile-design-bilimora",
        destination: "/treatments/digital-smile-design",
        permanent: true,
      },
      {
        source: "/root-canal-bilimora",
        destination: "/treatments/root-canal-treatment",
        permanent: true,
      },
      {
        source: "/treatments/dental-implants-bilimora",
        destination: "/treatments/dental-implants",
        permanent: true,
      },
      {
        source: "/treatments/root-canal-treatment-bilimora",
        destination: "/treatments/root-canal-treatment",
        permanent: true,
      },
      {
        source: "/treatments/braces-treatment-bilimora",
        destination: "/treatments/orthodontics",
        permanent: true,
      },
      {
        source: "/treatments/teeth-whitening-bilimora",
        destination: "/treatments/teeth-whitening",
        permanent: true,
      },
      {
        source: "/treatments/smile-designing-bilimora",
        destination: "/treatments/digital-smile-design",
        permanent: true,
      },
      {
        source: "/treatments/wisdom-tooth-removal-bilimora",
        destination: "/treatments/wisdom-tooth-removal",
        permanent: true,
      },
      {
        source: "/treatments/dental-crowns-bilimora",
        destination: "/treatments/dental-crowns-and-bridges",
        permanent: true,
      },
      // Legacy Diagnostics Slugs (Redirect to /services hub)
      {
        source: "/treatments/:slug(radiological-examination|periodontal-examination|tooth-sensitivity-test|digital-radiography|computed-tomography|occlusal-analysis|fluorescence-diagnostics|bacteriological-analysis|dental-consultation)",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/services/:slug(radiological-examination|periodontal-examination|tooth-sensitivity-test|digital-radiography|computed-tomography|occlusal-analysis|fluorescence-diagnostics|bacteriological-analysis|dental-consultation)",
        destination: "/services",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|mp4|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Headers for dummy medical template routes to force immediate de-indexing by Google
      {
        source: "/services/:path(cardiology-diagnostic-panel|general-consultation|pediatric-wellness-vaccination|neurology-migraine-care|dental-prophylaxis-hygiene|executive-health-concierge)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
        ],
      },
      {
        source: "/treatments/:path(cardiology-diagnostic-panel|general-consultation|pediatric-wellness-vaccination|neurology-migraine-care|dental-prophylaxis-hygiene|executive-health-concierge)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
