"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2,
  PhoneCall,
  Stethoscope,
} from "lucide-react";
import { BlogPost } from "@/lib/blog";
import { useContactModal } from "@/components/public/contact-modal";

interface BlogShowcaseViewProps {
  posts: BlogPost[];
  categories: string[];
}

export function BlogShowcaseView({ posts, categories }: BlogShowcaseViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { openContactModal } = useContactModal();

  // Filter posts based on search query and selected category
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.author.name.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [posts, selectedCategory, searchQuery]);

  // Featured post is the first featured or latest post
  const featuredPost = useMemo(() => {
    return posts.find((p) => p.featured) || posts[0];
  }, [posts]);

  // Rest of the posts (excluding featured post when in "All" view with no search)
  const isDefaultView = selectedCategory === "All" && searchQuery.trim() === "";
  const displayPosts = isDefaultView
    ? filteredPosts.filter((p) => p.slug !== featuredPost.slug)
    : filteredPosts;

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail("");
        setSubscribed(false);
      }, 5000);
    }
  };

  return (
    <div className="w-full space-y-8 sm:space-y-12">
      {/* Search & Filter Controls */}
      <section className="space-y-4 pt-1 sm:pt-2">
        <h1 className="sr-only">Dental Health Journal &amp; Articles</h1>
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Real-time Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search treatments, aligners, symptoms, or keywords..."
              aria-label="Search articles"
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 pl-11 pr-10 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-black dark:focus:border-white focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Active Results Counter */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="font-mono text-zinc-900 dark:text-white font-semibold">
              {filteredPosts.length}
            </span>
            <span>
              {filteredPosts.length === 1 ? "article found" : "articles found"}
            </span>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="ml-2 text-xs font-semibold text-black dark:text-white hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150 ${
              selectedCategory === "All"
                ? "bg-black dark:bg-white text-white dark:text-black shadow-md font-bold"
                : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300"
            }`}
          >
            All Articles ({posts.length})
          </button>
          {categories.map((cat) => {
            const count = posts.filter((p) => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-md font-bold"
                    : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED EDITORIAL SPOTLIGHT (Hero Card in Default View)               */}
      {/* ========================================================================= */}
      {isDefaultView && featuredPost && (
        <section aria-labelledby="featured-article-title">
          <div className="card group relative overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] shadow-md transition-all duration-300 hover:shadow-xl hover:border-black dark:hover:border-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Image Column */}
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[260px] sm:min-h-[340px] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent lg:hidden" />
                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-3 py-1 text-[11px] font-bold shadow-md">
                    <Sparkles className="h-3 w-3" />
                    <span>Featured Article</span>
                  </span>
                  <span className="rounded-full bg-black/75 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white">
                    {featuredPost.category}
                  </span>
                </div>
              </div>

              {/* Editorial Text Column */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    <Clock className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                    <span>{featuredPost.readTime}</span>
                    <span>•</span>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{featuredPost.publishedAt}</span>
                  </div>

                  <h2
                    id="featured-article-title"
                    className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight group-hover:text-black dark:group-hover:text-white transition-colors"
                  >
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="card-link focus:outline-none after:content-[''] after:absolute after:inset-0 after:z-0"
                    >
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                    {featuredPost.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featuredPost.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer with Author & CTA */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-heading text-sm font-bold shadow-sm">
                      {featuredPost.author.name.charAt(3) || "D"}
                    </div>
                    <div>
                      <div className="font-heading text-xs font-bold text-zinc-900 dark:text-white">
                        {featuredPost.author.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {featuredPost.author.role}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-black dark:text-white group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. ARTICLES GRID                                                          */}
      {/* ========================================================================= */}
      <section aria-label="Articles list" className="space-y-6">
        {displayPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-white">
                No matching dental articles found
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                We couldn&apos;t find any articles matching &ldquo;{searchQuery}&rdquo;.
                Try searching for general keywords like &ldquo;aligners&rdquo;, &ldquo;cavity&rdquo;,
                or &ldquo;implants&rdquo;.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-black dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-black hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <span>View All Articles</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
              <h2 className="font-heading text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                {isDefaultView ? "More Articles" : "Articles"}
              </h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {displayPosts.length} {displayPosts.length === 1 ? "article" : "articles"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayPosts.map((post) => (
                <article
                  key={post.slug}
                  className="card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] transition-all duration-300 hover:shadow-xl hover:border-black dark:hover:border-white"
                >
                  {/* Media Region */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                      <span className="rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white">
                        {post.category}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-white/90">
                        <Clock className="h-3 w-3 text-white" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Content Region */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                        <Calendar className="h-3 w-3" />
                        <span>{post.publishedAt}</span>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          prefetch={true}
                          className="card-link focus:outline-none after:content-[''] after:absolute after:inset-0 after:z-0"
                        >
                          {post.title}
                        </Link>
                      </h3>

                      <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-3">
                        {post.summary}
                      </p>
                    </div>

                    {/* Footer Region */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black font-heading text-xs font-bold shadow-sm">
                          {post.author.name.charAt(3) || "D"}
                        </div>
                        <div className="space-y-0.5">
                          <span className="block font-heading text-xs font-semibold text-zinc-900 dark:text-white leading-none">
                            {post.author.name.split(",")[0]}
                          </span>
                          <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {post.author.role}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-black dark:text-white group-hover:translate-x-1 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. CLINICAL CONSULTATION STUDIO BANNER                                    */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-black text-white p-8 sm:p-10 lg:p-12 border border-zinc-800 shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-xs font-semibold text-white">
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Direct Doctor Consultation</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Have a Specific Dental Concern or Question?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
              Don&apos;t let untreated symptoms worsen. Schedule an in-person clinical
              examination or discuss clear aligners, pain-free implants, and smile
              makeovers with our specialists in Bilimora.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-white" />
                Same-Day Emergency Appointments
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-white" />
                Zero-Wait Clinical Seating
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-white" />
                Transparent Pricing
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <button
              type="button"
              onClick={() => openContactModal()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-black hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-lg"
            >
              <span>Book Appointment Online</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="https://wa.me/917226098074?text=Hello%20CA%20Smile%20Dental%20Clinic,%20I%20have%20read%20your%20blog%20and%20would%20like%20to%20consult%20a%20dentist."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
            >
              <PhoneCall className="h-4 w-4 text-white" />
              <span>WhatsApp Us: +91 72260 98074</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. NEWSLETTER / SMILE TIPS INLINE FORM                                    */}
      {/* ========================================================================= */}
      <section className="rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] p-6 sm:p-10 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Monthly Smile Newsletter
          </span>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            Receive Evidence-Based Tooth Care Tips Directly in Your Inbox
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            No spam. Only practical oral hygiene guides, new dental technology
            updates, and seasonal care advice for your family.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-5 py-3 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-black dark:text-white" />
              <span>Thank you! You are now subscribed to CA Smile Insights.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                aria-label="Email address for dental newsletter"
                className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
              />
              <button
                type="submit"
                className="rounded-xl bg-black dark:bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm shrink-0"
              >
                Subscribe Free
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
