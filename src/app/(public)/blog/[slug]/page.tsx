import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  Share2,
  Tag,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { blogPosts, getPostBySlug } from "@/data/blog-posts";
import { getRelatedPosts } from "@/lib/blog";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookNowButton } from "@/components/ui/book-now-button";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Article Not Found | HealthSphere Journal",
    };
  }

  return {
    title: `${post.title} | HealthSphere Medical Journal`,
    description: post.summary,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
  };
}

export default function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const related = getRelatedPosts(post.slug, 2);

  return (
    <main className="py-12 sm:py-16">
      <SectionWrapper containerSize="narrow" className="py-0 sm:py-0 lg:py-0">
        <article className="space-y-10">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-brand-muted"
          >
            <Link
              href="/"
              className="transition-colors hover:text-brand-primary"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/blog"
              className="transition-colors hover:text-brand-primary"
            >
              Dental Journal
            </Link>
            <span>/</span>
            <span className="truncate font-semibold text-brand-text">
              {post.category}
            </span>
          </nav>

          {/* Article Header */}
          <header className="space-y-5 border-b border-brand-border pb-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default">{post.category}</Badge>
              <div className="flex items-center gap-1.5 text-xs text-brand-muted font-mono">
                <Clock
                  className="h-3.5 w-3.5 text-brand-primary"
                  aria-hidden="true"
                />
                <span>{post.readTime}</span>
              </div>
              <span className="text-brand-border">•</span>
              <span className="text-xs text-brand-muted font-mono">
                {post.publishedAt}
              </span>
            </div>

            <h1 className="font-heading text-3xl font-extrabold leading-[1.2] tracking-tight text-brand-text sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <p className="text-base leading-relaxed text-brand-muted sm:text-lg">
              {post.summary}
            </p>

            {/* Author Bar */}
            <div className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-surface p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white font-heading text-base font-bold dark:bg-white dark:text-black">
                  {post.author.name.split(" ")[1]?.charAt(0) || "D"}
                </div>
                <div>
                  <div className="font-heading text-sm font-bold text-brand-text">
                    {post.author.name}
                  </div>
                  <div className="text-xs text-brand-muted">
                    {post.author.role} • {post.author.credentials}
                  </div>
                </div>
              </div>
              <Badge
                variant="success"
                className="hidden text-[10px] sm:inline-flex"
              >
                Verified Dental Specialist
              </Badge>
            </div>
          </header>

          {/* Clinical Review Disclaimer Callout */}
          <div className="bg-brand-accent/20 flex items-start gap-3 rounded-2xl border border-brand-border p-4">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary"
              aria-hidden="true"
            />
            <div className="space-y-1 text-xs text-brand-muted">
              <span className="block font-semibold text-brand-text">
                Clinical Evidence &amp; Fact-Checking Standard
              </span>
              <span>
                All oral health articles on PedioDent are written or
                peer-reviewed by licensed dental surgeons. This
                content is for educational awareness and does not replace direct
                clinical examination.
              </span>
            </div>
          </div>

          {/* Article Body Content */}
          <div className="space-y-6 font-body text-sm leading-relaxed text-brand-text sm:text-base">
            {post.content.map((paragraph, index) => (
              <p key={index} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Article Tags */}
          <div className="flex flex-wrap items-center gap-2 border-t border-brand-border pt-6">
            <span className="mr-2 flex items-center gap-1.5 text-xs font-semibold text-brand-muted">
              <Tag className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tagged:</span>
            </span>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Schedule Consultation CTA Box */}
          <div className="border-brand-primary/30 space-y-4 rounded-clinic border-2 bg-brand-surface p-6 text-center shadow-sm sm:p-8">
            <h3 className="font-heading text-xl font-bold text-brand-text">
              Have Questions About This Condition?
            </h3>
            <p className="mx-auto max-w-lg text-xs text-brand-muted sm:text-sm">
              Our clinical specialists provide in-person diagnostics, treatment
              plans, and second opinions tailored to your health history.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <BookNowButton href="/contact" text="Book Now" size="md" />
              <Link href="/services">
                <Button variant="outline" size="md">
                  View Related Services
                </Button>
              </Link>
            </div>
          </div>

          {/* Related Articles Section */}
          {related.length > 0 && (
            <div className="space-y-6 border-t border-brand-border pt-10">
              <h3 className="font-heading text-xl font-bold text-brand-text">
                Related Health Insights
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {related.map((rel) => (
                  <Card
                    key={rel.slug}
                    className="hover:border-brand-primary/40 space-y-2 p-5 transition-colors"
                  >
                    <Badge variant="secondary" className="text-[10px]">
                      {rel.category}
                    </Badge>
                    <h4 className="font-heading text-sm font-bold text-brand-text transition-colors hover:text-brand-primary">
                      <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h4>
                    <p className="line-clamp-2 text-xs text-brand-muted">
                      {rel.summary}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Back button */}
          <div className="pt-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all medical articles</span>
            </Link>
          </div>
        </article>
      </SectionWrapper>
    </main>
  );
}
