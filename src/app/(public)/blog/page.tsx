import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  Calendar,
  ArrowRight,
  UserCheck,
  BookOpen,
  Sparkles,
  Smile,
} from "lucide-react";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllPosts, getAllCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Dental Health Blog & Expert Insights | PedioDent Smile Dental Clinic",
  description:
    "Evidence-based dental care guidance, pediatric dentistry, clear aligners, dental implants, and preventive wellness written directly by board-certified dental specialists.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "PedioDent Smile Dental Journal - Evidence-Based Oral Health Guides",
    description:
      "Actionable dental guides on gentle kids dentistry, invisible aligners, teeth whitening, and periodontal wellness.",
    url: "/blog",
  },
};

export default function BlogListPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <main className="py-10 sm:py-16">
      <SectionWrapper containerSize="default" className="py-0 sm:py-0 lg:py-0">
        <div className="space-y-10 sm:space-y-12">
          {/* Header */}
          <div className="max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              <Smile className="h-3.5 w-3.5 text-brand-primary" />
              <span>Dental Health Journal &amp; Guides</span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl lg:text-5xl">
              Doctor Insights for Your Healthy Smile
            </h1>
            <p className="text-base leading-relaxed text-brand-muted">
              Explore evidence-based dental articles authored and reviewed by our clinical surgeons.
              From gentle pediatric visits and clear aligners to pain-free implants and enamel protection.
            </p>
          </div>

          {/* Categories Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-brand-border pb-4">
            <span className="mr-2 text-xs font-semibold text-brand-muted">
              Topics:
            </span>
            <Badge variant="default" className="cursor-pointer">
              All Articles
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className="hover:bg-brand-accent/20 cursor-pointer text-xs"
              >
                {cat}
              </Badge>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.slug}
                className="hover:border-brand-primary/40 group flex flex-col justify-between transition-all duration-200 hover:shadow-lg rounded-2xl border border-brand-border/80 bg-brand-surface"
              >
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-semibold text-[11px]">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-brand-muted font-mono">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <div>
                    <h2 className="mb-2 font-heading text-lg sm:text-xl font-bold leading-snug text-brand-text transition-colors group-hover:text-brand-primary line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="line-clamp-3 text-xs leading-relaxed text-brand-muted sm:text-sm">
                      {post.summary}
                    </p>
                  </div>

                  {/* Author Bar */}
                  <div className="border-brand-border/60 flex items-center justify-between border-t pt-3">
                    <div className="space-y-0.5">
                      <span className="block font-heading text-xs font-semibold text-brand-text">
                        {post.author.name}
                      </span>
                      <span className="block text-[11px] text-brand-muted line-clamp-1">
                        {post.author.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-brand-muted font-mono shrink-0">
                      {post.publishedAt}
                    </span>
                  </div>
                </CardContent>

                <div className="p-5 pt-0 sm:p-6 sm:pt-0">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs rounded-xl group-hover:bg-brand-primary group-hover:text-white transition-all"
                    >
                      <span>Read Dental Article</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </main>
  );
}
