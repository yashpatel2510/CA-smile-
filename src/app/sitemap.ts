import { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { clinicalServices } from "@/data/services-data";
import { blogPosts } from "@/data/blog-posts";
import { getTreatmentsStoreData } from "@/lib/treatments-store";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("vercel.app")
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
      : process.env.NODE_ENV === "production"
        ? "https://www.casmiledentalclinic.com"
        : (env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  const lastModified = new Date();

  // Static public pages
  const staticPages = [
    "",
    "/services",
    "/treatments",
    "/about",
    "/doctors",
    "/blog",
    "/faq",
    "/contact",
    "/book",
    "/review",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority:
      route === ""
        ? 1.0
        : route === "/services" || route === "/treatments" || route === "/book"
          ? 0.9
          : 0.8,
  }));

  // Active dental treatment pages
  const treatmentsData = getTreatmentsStoreData();
  const activeTreatments = [
    ...(treatmentsData.treatments || []),
    ...(treatmentsData.diagnostics || []),
  ].filter((t) => t.isActive);

  const treatmentPages = activeTreatments.map((treatment) => ({
    url: `${baseUrl}/treatments/${treatment.id}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Dynamic clinical dental service pages
  const servicePages = clinicalServices.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
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

  return [...staticPages, ...treatmentPages, ...servicePages, ...blogPages];
}

