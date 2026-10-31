"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Pause,
  Play,
} from "lucide-react";
import { BlogPost } from "@/lib/blog";

interface BlogResponsiveShowcaseProps {
  posts: BlogPost[];
  autoRotateInterval?: number; // default 4500ms (4.5s)
  className?: string;
  desktopGridClassName?: string;
}

export function BlogResponsiveShowcase({
  posts,
  autoRotateInterval = 4500,
  className = "",
  desktopGridClassName = "hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8",
}: BlogResponsiveShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Auto-rotation interval on mobile
  useEffect(() => {
    if (!posts || posts.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [posts, isPaused, autoRotateInterval]);

  if (!posts || posts.length === 0) {
    return null;
  }

  const currentMobilePost = posts[currentIndex % posts.length] || posts[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX === null || touchStartY === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only swipe if horizontal move was greater than vertical move
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* ======================================================================= */}
      {/* 1. MOBILE VIEW (max-width: 767px)                                       */}
      {/* ONLY ONE CARD VISIBLE AT A TIME WITH AUTOMATIC ROTATION                 */}
      {/* ======================================================================= */}
      <div className="block md:hidden">
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Indicators Bar: Live Auto-play status + Slide counter */}
          <div className="flex items-center justify-between gap-2 px-1 pb-3 text-xs">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full ${isPaused ? "bg-amber-400" : "bg-emerald-400 animate-ping opacity-75"}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? "bg-amber-500" : "bg-emerald-500"}`} />
              </span>
              <span>{isPaused ? "Paused" : "Auto-rotating"}</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              <span className="text-zinc-900 dark:text-white font-bold">
                {currentIndex + 1}
              </span>
              <span>/</span>
              <span>{posts.length}</span>
            </div>
          </div>

          {/* Active Single Mobile Article Card */}
          <div className="relative overflow-hidden">
            <article
              key={currentMobilePost.slug}
              className="card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-right-4 duration-300"
            >
              {/* Media Region */}
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentMobilePost.image}
                  alt={currentMobilePost.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                  <span className="rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                    {currentMobilePost.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-white/90">
                    <Clock className="h-3 w-3 text-white" />
                    <span>{currentMobilePost.readTime}</span>
                  </span>
                </div>

                {/* Left & Right Quick Touch Arrows over the image */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  aria-label="Previous article"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 active:scale-95 transition-all shadow-md z-20 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  aria-label="Next article"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 active:scale-95 transition-all shadow-md z-20 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Content Region */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                    <Calendar className="h-3 w-3" />
                    <span>{currentMobilePost.publishedAt}</span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-black dark:group-hover:text-white transition-colors">
                    <Link
                      href={`/blog/${currentMobilePost.slug}`}
                      className="card-link focus:outline-none after:content-[''] after:absolute after:inset-0 after:z-0"
                    >
                      {currentMobilePost.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {currentMobilePost.summary}
                  </p>
                </div>

                {/* Footer Region */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black font-heading text-xs font-bold shadow-sm">
                      {currentMobilePost.author.name.charAt(3) || "D"}
                    </div>
                    <div className="space-y-0.5">
                      <span className="block font-heading text-xs font-semibold text-zinc-900 dark:text-white leading-none">
                        {currentMobilePost.author.name.split(",")[0]}
                      </span>
                      <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {currentMobilePost.author.role}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-black dark:text-white group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </article>
          </div>

          {/* Bottom Dot Indicators */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {posts.map((post, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={post.slug}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Jump to article ${idx + 1}: ${post.title}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-7 bg-black dark:bg-white"
                      : "w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. DESKTOP / TABLET VIEW (min-width: 768px)                             */}
      {/* Multi-column grid showing all posts side-by-side                       */}
      {/* ======================================================================= */}
      <div className={desktopGridClassName}>
        {posts.map((post) => (
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
                loading="lazy"
                decoding="async"
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
  );
}
