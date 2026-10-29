"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Tag,
  Stethoscope,
  PhoneCall,
  Sparkles,
  ChevronRight,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import { BlogPost } from "@/lib/blog";
import { useContactModal } from "@/components/public/contact-modal";

interface BlogDetailViewProps {
  post: BlogPost;
  related: BlogPost[];
  prevPost?: BlogPost;
  nextPost?: BlogPost;
}

export function BlogDetailView({
  post,
  related,
  prevPost,
  nextPost,
}: BlogDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { openContactModal } = useContactModal();

  // Scroll reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, (window.scrollY / totalHeight) * 100)
        );
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareOnWhatsApp = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(
        `Read "${post.title}" on CA Smile Dental Journal:\n`
      );
      window.open(`https://wa.me/?text=${text}${url}`, "_blank");
    }
  };

  return (
    <div className="w-full">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-black dark:bg-white transition-all duration-100 ease-out shadow-sm"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="space-y-10 sm:space-y-12">
        {/* ========================================================================= */}
        {/* 1. BREADCRUMBS & TOP NAV                                                  */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium"
          >
            <Link
              href="/"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-zinc-400" />
            <Link
              href="/blog"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Dental Journal
            </Link>
            <ChevronRight className="h-3 w-3 text-zinc-400" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px] sm:max-w-xs">
              {post.category}
            </span>
          </nav>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to all articles</span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 2. ARTICLE HEADER                                                         */}
        {/* ========================================================================= */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-3.5 py-1 text-xs font-bold shadow-sm">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <Clock className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
              <span>{post.readTime}</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <Calendar className="h-3.5 w-3.5" />
              <span>{post.publishedAt}</span>
            </div>
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.16]">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
            {post.summary}
          </p>

          {/* Social Share & Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-y border-zinc-100 dark:border-zinc-800/80 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-1">
                Share:
              </span>
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Share on WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Copy Article Link"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-black dark:text-white" />
                    <span className="text-black dark:text-white font-semibold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => openContactModal({ service: post.category })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-4 py-1.5 text-xs font-bold transition-all shadow-sm"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Consult Doctor</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3. HERO ARTICLE PHOTOGRAPH                                                */}
        {/* ========================================================================= */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-zinc-100 dark:bg-zinc-800 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 text-xs text-white/90 font-medium drop-shadow-sm flex items-center justify-between">
            <span>Clinical Photography • CA Smile Dental Center</span>
            <span className="hidden sm:inline-block font-mono text-[11px] bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
              {post.category}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DOCTOR PROFILE CARD & CLINICAL STANDARDS CALLOUT                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Doctor Card */}
          <div className="md:col-span-7 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] p-5 sm:p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black dark:bg-white text-white dark:text-black font-heading text-lg font-bold shadow-md">
              {post.author.name.charAt(3) || "D"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-bold text-zinc-900 dark:text-white">
                  {post.author.name}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-900 dark:text-white">
                  <CheckCircle2 className="h-3 w-3 text-black dark:text-white" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {post.author.role}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                {post.author.credentials}
              </p>
            </div>
          </div>

          {/* Clinical Evidence Standard Callout */}
          <div className="md:col-span-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5 sm:p-6 shadow-sm flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-zinc-900 dark:text-white mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="block font-bold text-zinc-900 dark:text-white">
                Fact-Checked &amp; Peer Reviewed
              </span>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                Written according to Indian Dental Association guidelines and
                clinical protocols. For education only.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. ARTICLE BODY                                                           */}
        {/* ========================================================================= */}
        <section className="space-y-6 pt-2">
          {post.content.map((paragraph, index) => {
            const isCallout =
              paragraph.startsWith("Takeaway:") || paragraph.startsWith("Clinical Protocol:");
            const parts = paragraph.split(":");
            const hasSectionHeading = parts.length > 1 && parts[0].length < 45 && !isCallout;

            if (isCallout) {
              return (
                <div
                  key={index}
                  className="rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-900/70 p-6 shadow-sm my-8"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-black dark:text-white shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-heading text-sm font-bold text-zinc-900 dark:text-white block">
                        Clinical Takeaway &amp; Doctor Recommendation
                      </span>
                      <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {parts.slice(1).join(":").trim()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            if (hasSectionHeading) {
              const heading = parts[0];
              const rest = parts.slice(1).join(":");
              return (
                <div key={index} className="space-y-2 pt-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                    {heading}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {rest.trim()}
                  </p>
                </div>
              );
            }

            return (
              <p
                key={index}
                className={`text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300 ${
                  index === 0 ? "font-medium text-zinc-800 dark:text-zinc-200 text-base sm:text-lg" : ""
                }`}
              >
                {paragraph}
              </p>
            );
          })}
        </section>

        {/* ========================================================================= */}
        {/* 6. ARTICLE TAGS                                                           */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-6">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-2">
            <Tag className="h-3.5 w-3.5" />
            <span>Tagged:</span>
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 7. IN-ARTICLE CLINICAL CONSULTATION CARD                                   */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-black text-white p-8 sm:p-10 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              <Stethoscope className="h-3.5 w-3.5" />
              <span>In-Person Consultation Available</span>
            </div>

            <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
              Have Questions About {post.category}?
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              Our clinical dental surgeons in Bilimora perform thorough digital
              examinations with zero guesswork. Book an appointment online or contact us directly on WhatsApp.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => openContactModal({ service: post.category })}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-black hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-md"
              >
                <span>Schedule Dental Checkup</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={`https://wa.me/917226098074?text=Hello%20CA%20Smile%20Dental%20Clinic,%20I%20read%20your%20article%20on%20${encodeURIComponent(post.title)}%20and%20would%20like%20to%20consult%20a%20doctor.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
              >
                <PhoneCall className="h-4 w-4 text-white" />
                <span>WhatsApp: +91 72260 98074</span>
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. PREVIOUS & NEXT ARTICLE NAVIGATION                                     */}
        {/* ========================================================================= */}
        {(prevPost || nextPost) && (
          <nav
            aria-label="Previous and Next Articles"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8"
          >
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121316] p-5 hover:border-black dark:hover:border-white hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-semibold mb-2">
                  <ArrowLeft className="h-3.5 w-3.5 text-black dark:text-white transition-transform group-hover:-translate-x-1" />
                  <span>Previous Article</span>
                </div>
                <h4 className="font-heading text-sm font-bold text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2">
                  {prevPost.title}
                </h4>
              </Link>
            ) : (
              <div />
            )}

            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121316] p-5 hover:border-black dark:hover:border-white hover:shadow-md transition-all text-right flex flex-col justify-between"
              >
                <div className="flex items-center justify-end gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-semibold mb-2">
                  <span>Next Article</span>
                  <ArrowRight className="h-3.5 w-3.5 text-black dark:text-white transition-transform group-hover:translate-x-1" />
                </div>
                <h4 className="font-heading text-sm font-bold text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2">
                  {nextPost.title}
                </h4>
              </Link>
            )}
          </nav>
        )}

        {/* ========================================================================= */}
        {/* 9. RELATED ARTICLES                                                       */}
        {/* ========================================================================= */}
        {related.length > 0 && (
          <section className="space-y-6 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-10">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                Related Health Insights
              </h3>
              <Link
                href="/blog"
                className="text-xs font-semibold text-black dark:text-white hover:underline inline-flex items-center gap-1"
              >
                <span>View all articles</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => (
                <article
                  key={rel.slug}
                  className="card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] transition-all hover:shadow-lg hover:border-black dark:hover:border-white"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white">
                        {rel.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{rel.readTime}</span>
                      </div>
                      <h4 className="font-heading text-sm font-bold text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2">
                        <Link
                          href={`/blog/${rel.slug}`}
                          className="card-link focus:outline-none after:content-[''] after:absolute after:inset-0 after:z-0"
                        >
                          {rel.title}
                        </Link>
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {rel.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between relative z-10 text-[11px] font-semibold text-black dark:text-white">
                      <span>Read Guide</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
