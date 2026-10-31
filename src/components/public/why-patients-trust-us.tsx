"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";

interface TrustFeature {
  id?: string;
  title: string;
  description: string;
}

const DEFAULT_FEATURES: TrustFeature[] = [
  {
    title: "Treatment cycle",
    description:
      "Thanks to our laboratory, we conduct all analyses and production on-site, ensuring speed, precision, and flawless results while maintaining full control over every stage of treatment.",
  },
  {
    title: "Safety guarantee",
    description:
      "We guarantee the quality of our treatment: If complications arise from procedures in our clinic, we'll fix the issue for free or refund your money. Your health is our top priority.",
  },
  {
    title: "Digital technology",
    description:
      "By using high-precision equipment such as a microscope, CT scanner and 3D imaging, we ensure accurate assessments and well-structured treatment plans for every case.",
  },
];

export function WhyPatientsTrustUs() {
  const shouldReduceMotion = useReducedMotion();
  const { brandConfig } = useClinicTheme();

  const trustConfig = brandConfig?.whyTrustUsSection;

  if (trustConfig?.enabled === false) {
    return null;
  }

  const headingLine1 = trustConfig?.headingLine1 || "Why patients";
  const headingLine2 = trustConfig?.headingLine2 || "trust us?";
  const backgroundImageUrl =
    trustConfig?.backgroundImageUrl || "/images/why-patients-trust-us-bg.jpg";
  const features: TrustFeature[] =
    Array.isArray(trustConfig?.features) && trustConfig.features.length > 0
      ? trustConfig.features
      : DEFAULT_FEATURES;

  // Split features for desktop 2-column aesthetic
  const leftFeatures =
    features.length === 3
      ? [features[0]]
      : features.filter((_, i) => i % 2 === 0);
  const rightFeatures =
    features.length === 3
      ? [features[1], features[2]]
      : features.filter((_, i) => i % 2 !== 0);

  return (
    <section
      id="why-patients-trust-us"
      className="relative w-full bg-black text-white overflow-hidden select-none"
    >
      {/* ========================================================================= */}
      {/* 1. DESKTOP / TABLET WIDESCREEN CINEMATIC VIEW (>= lg)                    */}
      {/* Matches the video screenshot 1:1 with dental chair on the left & text on right */}
      {/* ========================================================================= */}
      <div className="hidden lg:block relative w-full min-h-[640px] xl:min-h-[720px]">
        {/* Cinematic Dental Chair Background (aligned to the left) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundImageUrl}
            alt="State of the art dental clinic treatment chair and precision overhead illumination"
            className="w-full h-full object-cover object-left xl:object-[left_center]"
            loading="lazy"
            decoding="async"
          />
          {/* Gradient blend to ensure seamless black extending to the right edge */}
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black via-black/80 to-transparent" />
        </div>

        {/* Content Container (Grid positioned over the dark right side) */}
        <div className="relative z-10 mx-auto max-w-7xl px-8 lg:px-12 xl:px-16 py-16 xl:py-24 min-h-[640px] xl:min-h-[720px] flex items-center">
          <div className="grid grid-cols-12 w-full gap-8 xl:gap-12 items-center">
            {/* Left 5 columns: Empty spacer allowing the dental chair & spotlight to shine */}
            <div className="col-span-5 pointer-events-none" aria-hidden="true" />

            {/* Right 7 columns: Heading and Staggered 2-Column Features */}
            <div className="col-span-7 flex flex-col justify-center pl-2 xl:pl-6">
              {/* Grand Title */}
              <motion.h2
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="font-heading text-5xl xl:text-[68px] font-extrabold tracking-tight text-white leading-[1.05] mb-12 xl:mb-16"
              >
                {headingLine1}
                {headingLine2 && (
                  <>
                    <br />
                    {headingLine2}
                  </>
                )}
              </motion.h2>

              {/* 2-Column Staggered Cards */}
              <div className="grid grid-cols-2 gap-8 xl:gap-10 items-start">
                {/* Column 1 (offset lower to match the video layout) */}
                <div className="mt-14 xl:mt-16 space-y-10 xl:space-y-12">
                  {leftFeatures.map((item, idx) => (
                    <motion.div
                      key={item.id || idx}
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: 0.15 + idx * 0.08 }}
                      className="space-y-2.5 max-w-[280px] xl:max-w-[310px]"
                    >
                      <h3 className="font-heading text-lg xl:text-xl font-bold text-white tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs xl:text-[13px] leading-relaxed text-zinc-400 font-normal">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Column 2 */}
                <div className="space-y-10 xl:space-y-12">
                  {rightFeatures.map((item, idx) => (
                    <motion.div
                      key={item.id || idx}
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: 0.08 + idx * 0.12 }}
                      className="space-y-2.5 max-w-[280px] xl:max-w-[310px]"
                    >
                      <h3 className="font-heading text-lg xl:text-xl font-bold text-white tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs xl:text-[13px] leading-relaxed text-zinc-400 font-normal">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE & TABLET LAYOUT (< lg)                                         */}
      {/* Shows the illuminated chair first, then the title and features below     */}
      {/* ========================================================================= */}
      <div className="block lg:hidden w-full pb-16">
        {/* Top Visual: The illuminated chair */}
        <div className="relative w-full h-[280px] sm:h-[360px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundImageUrl}
            alt="State of the art dental clinic treatment chair"
            className="w-full h-full object-cover object-left"
            loading="lazy"
            decoding="async"
          />
          {/* Bottom fade into pure black */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        {/* Content Section on pure black */}
        <div className="relative z-10 px-6 sm:px-10 max-w-xl mx-auto -mt-6 space-y-8">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight"
          >
            {headingLine1}
            {headingLine2 && (
              <>
                <br />
                {headingLine2}
              </>
            )}
          </motion.h2>

          {/* Dynamic Feature Blocks */}
          <div className="space-y-6 pt-2">
            {features.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="space-y-2 border-l-2 border-white/20 pl-4"
              >
                <h3 className="font-heading text-lg font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 font-normal">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
