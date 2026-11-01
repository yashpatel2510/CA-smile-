import { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog-posts";
import { getTreatmentsStoreData } from "@/lib/treatments-store";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("127.0.0.1") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("vercel.app")
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
      : "https://www.casmiledentalclinic.com";
  const lastModified = new Date();

  // Static public pages (each page has unique, non-cannibalizing content)
  const staticPages = [
    "",
    "/services",
    "/about",
    "/doctors",
    "/blog",
    "/faq",
    "/contact",
    "/book",
    "/review",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority:
      route === ""
        ? 1.0
        : route === "/services" || route === "/book"
          ? 0.9
          : route === "/privacy" || route === "/terms"
            ? 0.5
            : 0.8,
  }));

  // Canonical dental treatment pages (Only genuine clinic treatments with dedicated treatment pages)
  const treatmentsData = getTreatmentsStoreData();
  const activeTreatments = (treatmentsData.treatments || []).filter((t) => t.isActive);

  const treatmentPages = activeTreatments.map((treatment) => ({
    url: `${baseUrl}/treatments/${treatment.id}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Dynamic health blog articles
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...treatmentPages, ...blogPages];
}
