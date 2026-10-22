"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export interface ShowcaseItem {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  category?: string;
  image: string;
  whatItIs?: string;
  howItWorks?: string;
  benefits?: string;
  procedure?: string[];
  result?: string;
  whatIfNotDone?: string;
  paragraphs: string[];
}

export const DIAGNOSTIC_ITEMS: ShowcaseItem[] = [
  {
    id: "radiological-examination",
    title: "Radiological examination",
    image: "/images/treatments/radiological-examination.jpg",
    paragraphs: [
      "High-precision panoramic and cephalometric digital radiology delivering complete structural insights into tooth roots, bone density, and anatomical canals.",
      "Our ultra-low dose diagnostic units minimize radiation exposure by up to 90% while providing immediate high-resolution digital clarity for accurate clinical evaluation.",
    ],
  },
  {
    id: "periodontal-examination",
    title: "Periodontal examination",
    image: "/images/treatments/periodontal-examination.jpg",
    paragraphs: [
      "Detailed clinical assessment of gum tissues, measuring periodontal pocket depths with calibrated titanium micro-probes to identify micro-inflammation before bone recession begins.",
      "Essential for safeguarding the foundational biological support of your teeth and planning individualized preventative or regenerative therapy.",
    ],
  },
  {
    id: "tooth-sensitivity-test",
    title: "Tooth sensitivity test",
    image: "/images/treatments/tooth-sensitivity.jpg",
    paragraphs: [
      "Precise thermal and electrical pulp vitality diagnostics used to evaluate sensory response, detect micro-fractures, and pinpoint concealed nerve inflammation.",
      "Provides immediate clarity to determine whether gentle remineralization, bonding, or targeted endodontic care is required.",
    ],
  },
  {
    id: "digital-radiography",
    title: "Digital radiography",
    image: "/images/treatments/digital-radiography.jpg",
    paragraphs: [
      "Next-generation chairside digital intraoral sensors transmitting instant crystal-clear radiographs directly to high-definition screens.",
      "Enables instant diagnosis during consultation with unmatched diagnostic precision and minimal patient wait time.",
    ],
  },
  {
    id: "computed-tomography",
    title: "Computed tomography",
    image: "/images/treatments/computed-tomography.jpg",
    paragraphs: [
      "Computed tomography is a fast, painless, and precise procedure that creates a 3D image of the teeth, jaw, and tissues.",
      "It helps assess bone structures, detect hidden pathologies, and plan treatment with accuracy. With minimal radiation, it is safe even for frequent use.",
    ],
  },
  {
    id: "occlusal-analysis",
    title: "Occlusal analysis",
    image: "/images/treatments/occlusal-analysis.jpg",
    paragraphs: [
      "Digital computerized evaluation of bite forces, tooth contact dynamics, and jaw joint movement using high-precision sensor wands.",
      "Identifies destructive chewing imbalances, relieves TMJ strain, and guarantees the lasting stability of veneers, crowns, and implants.",
    ],
  },
  {
    id: "fluorescence-diagnostics",
    title: "Fluorescence diagnostics",
    image: "/images/treatments/fluorescence-diagnostics.jpg",
    paragraphs: [
      "Optical fluorescence wavelength diagnostics illuminating dental enamel to expose hidden subsurface caries and early demineralization.",
      "Allows for biological tooth preservation and non-invasive micro-interventions long before traditional drilling would be required.",
    ],
  },
  {
    id: "bacteriological-analysis",
    title: "Bacteriological analysis",
    image: "/images/treatments/digital-radiography.jpg",
    paragraphs: [
      "Specialized laboratory testing of the oral microbiome to detect specific anaerobic periodontal pathogens and establish biological susceptibility profiles.",
      "Guides targeted, biocompatible antibacterial treatments to eliminate persistent infection and safeguard long-term implant integration.",
    ],
  },
];

export const TREATMENT_ITEMS: ShowcaseItem[] = [
  {
    id: "digital-smile-design",
    title: "Digital Smile Design",
    subtitle: "Computer Smile Planning",
    category: "Aesthetic Dentistry",
    image: "/images/treatments/digital-smile-design.jpg",
    whatItIs: "A modern computerized method that uses computer photos and scans to show you how your new smile will look before any treatment begins.",
    howItWorks: "Advanced imaging software maps your face and tooth shape to create a virtual 3D preview of your final smile.",
    benefits: "Gives you total clarity and lets you preview your results beforehand so you feel confident.",
    procedure: [
      "Taking initial photographs and digital scans.",
      "Processing images through specialized software.",
      "Reviewing the 3D computer simulation together.",
      "Using the finalized plan to guide treatment."
    ],
    result: "A predictable, beautifully balanced smile that matches your face.",
    whatIfNotDone: "You might undergo cosmetic dental treatments without knowing how the final outcome will look.",
    paragraphs: [
      "A modern computerized method that uses computer photos and scans to show you how your new smile will look before any treatment begins.",
      "Advanced imaging software maps your face and tooth shape to create a virtual 3D preview of your final smile."
    ],
  },
  {
    id: "dental-implants",
    title: "Dental Implants",
    subtitle: "Permanent Artificial Teeth",
    category: "Implantology",
    image: "/images/treatments/dental-implants.jpg",
    whatItIs: "The best way to replace missing teeth by placing a strong titanium post into the jawbone as a permanent artificial root.",
    howItWorks: "The titanium root bonds naturally with your jawbone over time, providing a sturdy foundation that looks and chews like a real tooth.",
    benefits: "Stops your jawbone from getting weak, restores full chewing power, and protects neighboring healthy teeth.",
    procedure: [
      "Initial examination and X-rays.",
      "Minor surgical placement of the titanium post.",
      "Healing period for bone fusion.",
      "Attaching a custom crown matching natural color."
    ],
    result: "A permanent, strong, and natural-looking tooth replacement.",
    whatIfNotDone: "Leaving gaps can cause surrounding teeth to drift, bone to weaken, and difficulty chewing.",
    paragraphs: [
      "The best way to replace missing teeth by placing a strong titanium post into the jawbone as a permanent artificial root.",
      "The titanium root bonds naturally with your jawbone over time, providing a sturdy foundation that looks and chews like a real tooth."
    ],
  },
  {
    id: "full-mouth-rehabilitation",
    title: "Full Mouth Rehabilitation",
    subtitle: "Complete Smile Makeover",
    category: "Restorative Dentistry",
    image: "/images/treatments/full-mouth-rehab.jpg",
    whatItIs: "A complete treatment plan to repair and rebuild all your upper and lower teeth together.",
    howItWorks: "Combines restorative treatments to fix severe tooth wear, broken teeth, bite problems, or constant jaw pain.",
    benefits: "Restores full mouth health, improves chewing, and gives you back a healthy mouth step by step.",
    procedure: [
      "Diagnostic evaluation of bite and teeth.",
      "Creating a customized master plan.",
      "Foundation work like root canals or fillings.",
      "Placing crowns, bridges, or implants."
    ],
    result: "A fully restored, functional, and healthy mouth with a radiant smile.",
    whatIfNotDone: "Widespread decay, broken teeth, and bad bites will worsen, leading to constant pain and tooth loss.",
    paragraphs: [
      "A complete treatment plan to repair and rebuild all your upper and lower teeth together.",
      "Combines restorative treatments to fix severe tooth wear, broken teeth, bite problems, or constant jaw pain."
    ],
  },
  {
    id: "dental-crowns-and-bridges",
    title: "Dental Crowns & Bridges",
    subtitle: "Caps and Fixed Teeth",
    category: "Prosthodontics",
    image: "/images/treatments/dental-crowns.jpg",
    whatItIs: "Strong protective covers (crowns) for weak or broken teeth, and artificial teeth (bridges) used to fill empty spaces.",
    howItWorks: "Crowns fit securely over a weak tooth like a helmet to protect it, while bridges use artificial teeth to span across empty gaps.",
    benefits: "Crowns save weak teeth from breaking, while bridges fill gaps so you can smile and chew without worry.",
    procedure: [
      "Shaping and cleaning the tooth/anchor teeth.",
      "Taking precise impressions.",
      "Creating a custom crown or bridge.",
      "Cementing the restoration permanently."
    ],
    result: "A durable, tooth-colored cover or bridge that blends seamlessly.",
    whatIfNotDone: "A weak tooth can fracture completely, and gaps can cause neighboring teeth to shift.",
    paragraphs: [
      "Strong protective covers (crowns) for weak or broken teeth, and artificial teeth (bridges) used to fill empty spaces.",
      "Crowns fit securely over a weak tooth like a helmet to protect it, while bridges use artificial teeth to span across empty gaps."
    ],
  },
  {
    id: "root-canal-treatment",
    title: "Root Canal Treatment",
    subtitle: "Nerve Treatment to Save the Tooth",
    category: "Endodontics",
    image: "/images/treatments/root-canal.jpg",
    whatItIs: "A procedure to clean out a badly infected or aching tooth instead of pulling it out.",
    howItWorks: "The infected, painful nerve tissue inside the root is safely removed, and the inner space is cleaned and sealed.",
    benefits: "Takes away your toothache, stops infection from spreading, and lets you keep your natural tooth.",
    procedure: [
      "Numbing the area.",
      "Creating a small opening to access the nerve.",
      "Cleaning and disinfecting canals.",
      "Sealing roots and placing a protective crown."
    ],
    result: "A healthy, pain-free tooth that functions normally without discomfort.",
    whatIfNotDone: "Infection will spread deeper into the bone, causing severe swelling, excruciating pain, and tooth extraction.",
    paragraphs: [
      "A procedure to clean out a badly infected or aching tooth instead of pulling it out.",
      "The infected, painful nerve tissue inside the root is safely removed, and the inner space is cleaned and sealed."
    ],
  },
  {
    id: "wisdom-tooth-removal",
    title: "Wisdom Tooth Removal",
    subtitle: "Painful Back Tooth Surgery",
    category: "Oral Surgery",
    image: "/images/treatments/wisdom-tooth.jpg",
    whatItIs: "A safe minor surgery to take out back molar teeth that are stuck, causing pain, or crowding other teeth.",
    howItWorks: "Using local anesthesia, the dentist gently loosens and removes the troublesome wisdom tooth to relieve pressure.",
    benefits: "Stops severe pain, prevents gum infections, and keeps your other teeth straight.",
    procedure: [
      "Checking root position with X-ray.",
      "Numbing the area.",
      "Removing the tooth from its socket.",
      "Placing a small stitch and giving care advice."
    ],
    result: "Permanent relief from deep jaw pressure, pain, and recurring swelling.",
    whatIfNotDone: "Impacted wisdom teeth can cause severe crowding of front teeth, cysts, and painful gum infections.",
    paragraphs: [
      "A safe minor surgery to take out back molar teeth that are stuck, causing pain, or crowding other teeth.",
      "Using local anesthesia, the dentist gently loosens and removes the troublesome wisdom tooth to relieve pressure."
    ],
  },
  {
    id: "gum-treatment",
    title: "Gum Treatment",
    subtitle: "Care for Bleeding and Weak Gums",
    category: "Periodontics",
    image: "/images/treatments/gum-treatment.jpg",
    whatItIs: "Special care to clean and heal your gums when they bleed, swell, or feel sore.",
    howItWorks: "Involves deep cleanings below the gumline to remove hardened tartar and bacteria that cause inflammation.",
    benefits: "Stops your gums from bleeding, removes bad breath, and keeps your teeth firmly anchored.",
    procedure: [
      "Evaluating gum health.",
      "Professional scaling to clean plaque/tartar.",
      "Smoothing root surfaces below gumline.",
      "Recommending home brushing techniques."
    ],
    result: "Pink, firm, healthy gums that do not bleed when brushing.",
    whatIfNotDone: "Untreated gum disease destroys the jawbone holding your teeth, leading to loose teeth and tooth loss.",
    paragraphs: [
      "Special care to clean and heal your gums when they bleed, swell, or feel sore.",
      "Involves deep cleanings below the gumline to remove hardened tartar and bacteria that cause inflammation."
    ],
  },
  {
    id: "orthodontics",
    title: "Orthodontics",
    subtitle: "Braces and Clear Aligners for Crooked Teeth",
    category: "Orthodontics",
    image: "/images/treatments/orthodontics.jpg",
    whatItIs: "Treatments to straighten crooked teeth and fix bite problems using traditional braces or invisible trays.",
    howItWorks: "Applies gentle, steady pressure over time to guide your teeth into their correct positions.",
    benefits: "Gives you a straight smile and makes it much easier to clean your teeth properly.",
    procedure: [
      "Examination and analysis.",
      "Customizing treatment plan with braces/trays.",
      "Periodic adjustments.",
      "Providing a retainer to hold teeth in place."
    ],
    result: "A straight, beautiful smile and a healthy bite that lasts a lifetime.",
    whatIfNotDone: "Crooked teeth are hard to clean, leading to higher risks of decay, gum disease, and jaw strain.",
    paragraphs: [
      "Treatments to straighten crooked teeth and fix bite problems using traditional braces or invisible trays.",
      "Applies gentle, steady pressure over time to guide your teeth into their correct positions."
    ],
  },
  {
    id: "teeth-whitening",
    title: "Teeth Whitening",
    subtitle: "Making Yellow Teeth Bright and Clean",
    category: "Cosmetic Care",
    image: "/images/treatments/teeth-whitening.jpg",
    whatItIs: "A safe cosmetic treatment to clean away deep stains and make your yellow or dull teeth sparkling white.",
    howItWorks: "Uses safe clinical-grade whitening gel that gently breaks down and removes stains caused by tea, coffee, or aging.",
    benefits: "Removes deep stains and gives you a bright, confident smile instantly.",
    procedure: [
      "Checking teeth/gums.",
      "Applying gum barrier.",
      "Applying professional whitening gel.",
      "Rinsing to reveal brightened smile."
    ],
    result: "A visibly whiter, cleaner, and vibrant smile in one visit.",
    whatIfNotDone: "Yellow or stained teeth will continue to darken with age and diet, affecting your smile confidence.",
    paragraphs: [
      "A safe cosmetic treatment to clean away deep stains and make your yellow or dull teeth sparkling white.",
      "Uses safe clinical-grade whitening gel that gently breaks down and removes stains caused by tea, coffee, or aging."
    ],
  },
  {
    id: "restorative-dentistry",
    title: "Restorative Dentistry",
    subtitle: "Tooth Fillings and Repairs",
    category: "General Dentistry",
    image: "/images/treatments/tooth-fillings.jpg",
    whatItIs: "Simple treatments using tooth-colored materials to fill cavities and repair broken or decayed teeth.",
    howItWorks: "The decayed portion of the tooth is cleaned out and filled with a strong composite material that bonds directly to the tooth.",
    benefits: "Stops tooth decay from getting bigger and brings back your normal chewing strength.",
    procedure: [
      "Numbing the area.",
      "Cleaning out decay.",
      "Placing tooth-colored material in layers.",
      "Hardening with special light and polishing."
    ],
    result: "A strong, restored tooth that looks natural and functions without pain.",
    whatIfNotDone: "Small cavities will grow larger, reaching the nerve and causing severe toothaches requiring root canals.",
    paragraphs: [
      "Simple treatments using tooth-colored materials to fill cavities and repair broken or decayed teeth.",
      "The decayed portion of the tooth is cleaned out and filled with a strong composite material that bonds directly to the tooth."
    ],
  },
  {
    id: "children-dentistry",
    title: "Children Dentistry",
    subtitle: "Special Dental Care for Kids",
    category: "Pediatric Dentistry",
    image: "/images/treatments/children-dentistry.jpg",
    whatItIs: "Gentle and friendly dental care specially designed for children and teenagers.",
    howItWorks: "Focuses on preventive education, stopping tooth worms (cavities) early, and making visits fun and fear-free.",
    benefits: "Teaches kids how to brush properly, prevents early decay, and ensures a lifetime of healthy smiles.",
    procedure: [
      "Friendly introduction and exam.",
      "Preventive treatments (fluoride/sealants).",
      "Gentle fillings if required.",
      "Teaching proper brushing habits."
    ],
    result: "A healthy set of teeth, strong oral habits, and a happy child.",
    whatIfNotDone: "Ignored cavities in kids cause severe pain, infections, difficulty eating, and crooked permanent teeth later.",
    paragraphs: [
      "Gentle and friendly dental care specially designed for children and teenagers.",
      "Focuses on preventive education, stopping tooth worms (cavities) early, and making visits fun and fear-free."
    ],
  },
  {
    id: "porcelain-veneers",
    title: "Porcelain Veneers",
    subtitle: "Thin White Shells for Front Teeth",
    category: "Cosmetic & Aesthetics",
    image: "/images/treatments/porcelain-veneers.jpg",
    whatItIs: "Very thin, tooth-colored custom shells attached to the front of your teeth to hide flaws.",
    howItWorks: "A tiny fraction of enamel is gently shaped from the front of the tooth, and the custom porcelain shell is bonded on top.",
    benefits: "Instantly fixes chipped, stained, cracked, or gapped front teeth for a clean, attractive smile.",
    procedure: [
      "Discussing goals and checking health.",
      "Trimming a thin layer of enamel.",
      "Taking impressions for custom veneers.",
      "Bonding veneers securely."
    ],
    result: "A stunning, stain-resistant, perfectly straight, and dazzling smile.",
    whatIfNotDone: "Visible chips, severe discoloration, or gaps will remain and cannot be fixed by standard whitening.",
    paragraphs: [
      "Very thin, tooth-colored custom shells attached to the front of your teeth to hide flaws.",
      "A tiny fraction of enamel is gently shaped from the front of the tooth, and the custom porcelain shell is bonded on top."
    ],
  },
  {
    id: "dentures",
    title: "Dentures",
    subtitle: "Removable Artificial Teeth",
    category: "Prosthodontics",
    image: "/images/treatments/dentures.jpg",
    whatItIs: "Removable artificial teeth and gums (available as full or partial sets) designed to replace missing teeth.",
    howItWorks: "Custom-crafted to fit comfortably over your gums, supporting your facial structure and enabling you to eat and speak normally.",
    benefits: "Restores a full smile, improves speech clarity, helps you chew food easily, and supports facial muscles.",
    procedure: [
      "Taking measurements and impressions of your mouth.",
      "Creating a trial model to check fit and bite.",
      "Manufacturing your final custom dentures.",
      "Fitting and adjusting them for comfort."
    ],
    result: "A comfortable, natural-looking set of teeth that restores your confidence and daily functions.",
    whatIfNotDone: "Missing multiple teeth makes chewing difficult, causes facial sagging around the cheeks and mouth, and affects speech.",
    paragraphs: [
      "Removable artificial teeth and gums (available as full or partial sets) designed to replace missing teeth.",
      "Custom-crafted to fit comfortably over your gums, supporting your facial structure and enabling you to eat and speak normally."
    ],
  },
];

function useIsLaptopOrTablet() {
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    const checkEligibility = () => {
      // Laptop and tablet screens (>= 768px). Mobile screens (< 768px) do not trigger hover
      const isTabletOrLaptop = typeof window !== "undefined" && window.innerWidth >= 768;
      setIsEligible(isTabletOrLaptop);
    };

    checkEligibility();
    window.addEventListener("resize", checkEligibility);
    return () => window.removeEventListener("resize", checkEligibility);
  }, []);

  return isEligible;
}

export type TransitionSpeed = "slow" | "normal" | "fast";

export const TRANSITION_CONFIGS = {
  slow: {
    heightOpenDuration: 0.75,
    heightExitDuration: 0.52,
    opacityOpenDuration: 0.65,
    opacityExitDuration: 0.38,
    xOpenDuration: 0.7,
    xExitDuration: 0.45,
    easeOpen: [0.16, 1, 0.3, 1] as [number, number, number, number],
    easeExit: [0.16, 1, 0.3, 1] as [number, number, number, number],
    leaveTimeoutMs: 140,
    stagger1: 0.08,
    stagger2: 0.16,
    stagger3: 0.24,
    stagger4: 0.32,
    imgDuration: 0.72,
    txtDuration: 0.7,
  },
  normal: {
    heightOpenDuration: 0.48,
    heightExitDuration: 0.35,
    opacityOpenDuration: 0.38,
    opacityExitDuration: 0.24,
    xOpenDuration: 0.42,
    xExitDuration: 0.3,
    easeOpen: [0.16, 1, 0.3, 1] as [number, number, number, number],
    easeExit: [0.16, 1, 0.3, 1] as [number, number, number, number],
    leaveTimeoutMs: 120,
    stagger1: 0.04,
    stagger2: 0.08,
    stagger3: 0.12,
    stagger4: 0.16,
    imgDuration: 0.45,
    txtDuration: 0.45,
  },
  fast: {
    heightOpenDuration: 0.32,
    heightExitDuration: 0.24,
    opacityOpenDuration: 0.25,
    opacityExitDuration: 0.18,
    xOpenDuration: 0.28,
    xExitDuration: 0.2,
    easeOpen: [0.16, 1, 0.3, 1] as [number, number, number, number],
    easeExit: [0.16, 1, 0.3, 1] as [number, number, number, number],
    leaveTimeoutMs: 80,
    stagger1: 0.02,
    stagger2: 0.04,
    stagger3: 0.06,
    stagger4: 0.08,
    imgDuration: 0.3,
    txtDuration: 0.3,
  },
};

interface ShowcaseBlockProps {
  title: string;
  subtitle: string;
  items: ShowcaseItem[];
  defaultOpenId?: string | null;
  speed?: TransitionSpeed;
  allOpen?: boolean;
}

function ShowcaseBlock({
  title,
  subtitle,
  items,
  defaultOpenId = null,
  speed = "slow",
  allOpen = false,
}: ShowcaseBlockProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    if (allOpen) {
      return new Set(items.map((i) => i.id));
    }
    return defaultOpenId ? new Set([defaultOpenId]) : new Set();
  });
  const [showAll, setShowAll] = useState(allOpen);
  const isLaptopOrTablet = useIsLaptopOrTablet();
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (allOpen && items.length > 0) {
      setOpenIds(new Set(items.map((i) => i.id)));
      setShowAll(true);
    }
  }, [items, allOpen]);

  const cfg = TRANSITION_CONFIGS[speed] || TRANSITION_CONFIGS.slow;
  const displayedItems = showAll || items.length <= 8 ? items : items.slice(0, 8);

  const toggleItem = (id: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allOpen) {
          return new Set([id]);
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleMouseEnter = (id: string) => {
    if (allOpen) return;
    if (!isLaptopOrTablet) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpenIds(new Set([id]));
  };

  const handleKeepOpen = () => {
    if (allOpen) return;
    if (!isLaptopOrTablet) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = (id: string) => {
    if (allOpen) return;
    if (!isLaptopOrTablet) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenIds(new Set());
    }, cfg.leaveTimeoutMs);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      {/* Top Header: Title on Left, Subtitle on Right (Exact layout from user image 1:1) */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-8 sm:pb-12">
        <h2 className="text-6xl sm:text-7xl lg:text-[88px] xl:text-[96px] font-bold tracking-tight text-black leading-none font-sans">
          {title}
        </h2>
        <p className="text-xs sm:text-[13px] text-zinc-500 font-normal leading-relaxed max-w-[320px] md:pt-3 text-left">
          {subtitle}
        </p>
      </div>

      {/* Accordion Rows */}
      <div
        className="w-full"
        onMouseLeave={() => {
          if (allOpen) return;
          if (!isLaptopOrTablet) return;
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          hoverTimeoutRef.current = setTimeout(() => {
            setOpenIds(new Set());
          }, cfg.leaveTimeoutMs);
        }}
      >
        {displayedItems.map((item, idx) => {
          const isOpen = openIds.has(item.id);
          const isFirst = idx === 0;
          const nextIsOpen = idx + 1 < displayedItems.length && openIds.has(displayedItems[idx + 1].id);
          const prevIsOpen = idx > 0 && openIds.has(displayedItems[idx - 1].id);
          const num = String(idx + 1).padStart(2, "0");

          return (
            <div
              key={item.id}
              className="w-full relative"
              onMouseLeave={() => handleMouseLeave(item.id)}
            >
              {/* Collapsed State Row: aligned precisely within left 12-col grid column */}
              {!isOpen && (
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                  <div
                    className={`lg:col-span-6 ${
                      !nextIsOpen ? "border-b border-zinc-200" : ""
                    } ${isFirst && !prevIsOpen ? "border-t border-zinc-200" : ""}`}
                    onMouseEnter={() => handleMouseEnter(item.id)}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="group w-full flex items-center justify-between py-4 sm:py-5 text-left transition-colors focus:outline-none"
                      aria-expanded={false}
                    >
                      <div className="flex items-center gap-4 sm:gap-5">
                        <span className="font-mono text-xs sm:text-sm text-zinc-400 font-normal w-6 sm:w-7 shrink-0">
                          {num}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xl sm:text-2xl lg:text-[26px] font-normal tracking-tight text-zinc-900 group-hover:font-medium group-hover:text-black transition-all duration-150">
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="text-xs text-zinc-400 group-hover:text-zinc-600 transition-colors">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="p-1 text-black transition-transform duration-200 group-hover:scale-110">
                        <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
                      </span>
                    </button>
                  </div>
                  {/* Empty right column: no hover listener */}
                </div>
              )}

              {/* Expanded State Panel: smooth left-to-right entrance and right-to-left exit */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    onMouseEnter={handleKeepOpen}
                    onMouseMove={handleKeepOpen}
                    onMouseLeave={() => handleMouseLeave(item.id)}
                    initial={{ opacity: 0, height: 0, x: -36 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      x: 0,
                      transition: {
                        height: { duration: cfg.heightOpenDuration, ease: cfg.easeOpen },
                        opacity: { duration: cfg.opacityOpenDuration, ease: "easeOut" },
                        x: { duration: cfg.xOpenDuration, ease: cfg.easeOpen },
                      },
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      x: -36,
                      transition: {
                        height: { duration: cfg.heightExitDuration, ease: cfg.easeExit },
                        opacity: { duration: cfg.opacityExitDuration, ease: "easeIn" },
                        x: { duration: cfg.xExitDuration, ease: cfg.easeExit },
                      },
                    }}
                    className="overflow-hidden border-t border-b border-zinc-200"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 py-4 sm:py-5 items-stretch">
                      {/* Left: Clean Studio Image sized strictly to match content height */}
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { duration: cfg.imgDuration, delay: cfg.stagger1, ease: cfg.easeOpen },
                        }}
                        exit={{
                          opacity: 0,
                          x: -30,
                          transition: { duration: cfg.opacityExitDuration, ease: "easeIn" },
                        }}
                        className="lg:col-span-6 relative overflow-hidden rounded-xs bg-zinc-100 w-full aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover object-center lg:absolute lg:inset-0"
                        />
                        {/* Focus indicator dot */}
                        <div
                          className="absolute bottom-4 left-[64%] -translate-x-1/2 w-5 h-5 rounded-full bg-zinc-800/60 pointer-events-none"
                          aria-hidden="true"
                        />
                      </motion.div>

                      {/* Right: Title, ONLY What It Is and How It Works, Action Buttons */}
                      <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { duration: cfg.txtDuration, delay: cfg.stagger2, ease: cfg.easeOpen },
                        }}
                        exit={{
                          opacity: 0,
                          x: -24,
                          transition: { duration: cfg.opacityExitDuration, ease: "easeIn" },
                        }}
                        className="lg:col-span-6 flex flex-col justify-start pt-1 lg:pt-0"
                      >
                        {/* Heading with Arrow pointing up-right (↗) */}
                        <div
                          onClick={() => toggleItem(item.id)}
                          className="flex items-start justify-between cursor-pointer group select-none gap-3"
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <span className="font-mono text-xs sm:text-sm text-zinc-400 font-normal shrink-0 mt-1 sm:mt-1.5 w-6 sm:w-7">
                              {num}
                            </span>
                            <div>
                              <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold tracking-tight text-black group-hover:opacity-85 transition-opacity leading-tight">
                                {item.title}
                              </h3>
                              {item.subtitle && (
                                <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItem(item.id);
                            }}
                            className="p-1 text-black transition-transform duration-200 group-hover:scale-110 focus:outline-none shrink-0"
                            aria-label={`Collapse ${item.title}`}
                          >
                            <ArrowUpRight className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2]" />
                          </button>
                        </div>

                        {/* Only these two details are shown on the home page card: 1. What it is, 2. How it works */}
                        <div className="mt-4 sm:mt-5 space-y-3.5">
                          {/* 1. What it is */}
                          <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3 sm:p-3.5">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700 mb-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 inline-block" />
                              What it is
                            </div>
                            <p className="text-xs sm:text-[13.5px] text-zinc-800 leading-relaxed font-normal">
                              {item.whatItIs || item.paragraphs[0]}
                            </p>
                          </div>

                          {/* 2. How it works */}
                          <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3 sm:p-3.5">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 mb-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
                              How it works
                            </div>
                            <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-normal">
                              {item.howItWorks || item.paragraphs[1] || item.paragraphs[0]}
                            </p>
                          </div>
                        </div>

                        {/* Actions: Full separate treatment page & Book appointment */}
                        <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
                          <Link
                            href={`/treatments/${item.id}`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-black text-white px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-medium hover:bg-zinc-800 transition-all duration-150 active:scale-95 shadow-sm"
                          >
                            <span>View Full Treatment &amp; Timeline</span>
                            <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                          </Link>
                          <Link
                            href={`/book?treatment=${encodeURIComponent(item.title)}`}
                            className="inline-flex items-center justify-center rounded-full border border-zinc-300/90 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-normal text-zinc-800 bg-white hover:border-black hover:text-black transition-all duration-200 active:scale-95 shadow-2xs"
                          >
                            Book an appointment
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* View More / View All 13 Treatments option below 8th treatment */}
      {items.length > 8 && !allOpen && (
        <div className="pt-8 sm:pt-10 flex items-center justify-center border-t border-zinc-200 mt-6">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-black bg-black text-white text-xs sm:text-sm font-medium hover:bg-zinc-800 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <span>{showAll ? "Show Top 8 Treatments" : `View All ${items.length} Treatments (${items.length - 8} More)`}</span>
            <ArrowDownLeft className={`h-4 w-4 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
}

interface DiagnosticFramerShowcaseProps {
  title: string;
  subtitle: string;
  items: ShowcaseItem[];
  defaultOpenId?: string | null;
  speed?: TransitionSpeed;
  allOpen?: boolean;
}

function DiagnosticFramerShowcase({
  title,
  subtitle,
  items,
  defaultOpenId = null,
  speed = "slow",
  allOpen = false,
}: DiagnosticFramerShowcaseProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    if (allOpen) {
      return new Set(items.map((i) => i.id));
    }
    return defaultOpenId ? new Set([defaultOpenId]) : new Set();
  });
  const isLaptopOrTablet = useIsLaptopOrTablet();
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (allOpen && items.length > 0) {
      setOpenIds(new Set(items.map((i) => i.id)));
    }
  }, [items, allOpen]);

  const cfg = TRANSITION_CONFIGS[speed] || TRANSITION_CONFIGS.slow;

  const toggleItem = (id: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allOpen) {
          return new Set([id]);
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleMouseEnter = (id: string) => {
    if (allOpen) return;
    if (!isLaptopOrTablet) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpenIds(new Set([id]));
  };

  const handleKeepOpen = () => {
    if (allOpen) return;
    if (!isLaptopOrTablet) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = (id: string) => {
    if (allOpen) return;
    if (!isLaptopOrTablet) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenIds(new Set());
    }, cfg.leaveTimeoutMs);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      {/* Top Header: Title on Left, Subtitle on Right */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-8 sm:pb-12">
        <h2 className="text-6xl sm:text-7xl lg:text-[88px] xl:text-[96px] font-bold tracking-tight text-black leading-none font-sans">
          {title}
        </h2>
        <p className="text-xs sm:text-[13px] text-zinc-500 font-normal leading-relaxed max-w-[320px] md:pt-3 text-left">
          {subtitle}
        </p>
      </div>

      {/* Accordion Rows: All closed first, expanding to Framer card design (spacer.framer.ai) when opened */}
      <div
        className="w-full"
        onMouseLeave={() => {
          if (allOpen) return;
          if (!isLaptopOrTablet) return;
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          hoverTimeoutRef.current = setTimeout(() => {
            setOpenIds(new Set());
          }, cfg.leaveTimeoutMs);
        }}
      >
        {items.map((item, idx) => {
          const isOpen = openIds.has(item.id);
          const isFirst = idx === 0;
          const nextIsOpen = idx + 1 < items.length && openIds.has(items[idx + 1].id);
          const prevIsOpen = idx > 0 && openIds.has(items[idx - 1].id);
          const num = String(idx + 1).padStart(2, "0");
          const description = item.paragraphs[0] || "";

          return (
            <div
              key={item.id}
              className="w-full relative"
              onMouseLeave={() => handleMouseLeave(item.id)}
            >
              {/* Collapsed State Row: All closed first, matching treatment section */}
              {!isOpen && (
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                  <div
                    className={`lg:col-span-6 ${
                      !nextIsOpen ? "border-b border-zinc-200" : ""
                    } ${isFirst && !prevIsOpen ? "border-t border-zinc-200" : ""}`}
                    onMouseEnter={() => handleMouseEnter(item.id)}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="group w-full flex items-center justify-between py-4 sm:py-5 text-left transition-colors focus:outline-none"
                      aria-expanded={false}
                    >
                      <div className="flex items-center gap-4 sm:gap-5">
                        <span className="font-mono text-xs sm:text-sm text-zinc-400 font-normal w-6 sm:w-7">
                          {num}
                        </span>
                        <span className="text-xl sm:text-2xl lg:text-[26px] font-normal tracking-tight text-zinc-900 group-hover:font-medium group-hover:text-black transition-all duration-150">
                          {item.title}
                        </span>
                      </div>
                      <span className="p-1 text-black transition-transform duration-200 group-hover:scale-110">
                        <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
                      </span>
                    </button>
                  </div>
                  {/* Empty right column: no hover listener */}
                </div>
              )}

              {/* Expanded State Card: Reveals spacer.framer.ai card design with photo, text, number & action */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    onMouseEnter={handleKeepOpen}
                    onMouseMove={handleKeepOpen}
                    onMouseLeave={() => handleMouseLeave(item.id)}
                    initial={{ opacity: 0, height: 0, x: -36 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      x: 0,
                      transition: {
                        height: { duration: cfg.heightOpenDuration, ease: cfg.easeOpen },
                        opacity: { duration: cfg.opacityOpenDuration, ease: "easeOut" },
                        x: { duration: cfg.xOpenDuration, ease: cfg.easeOpen },
                      },
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      x: -36,
                      transition: {
                        height: { duration: cfg.heightExitDuration, ease: cfg.easeExit },
                        opacity: { duration: cfg.opacityExitDuration, ease: "easeIn" },
                        x: { duration: cfg.xExitDuration, ease: cfg.easeExit },
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="py-3 sm:py-4">
                      <div className="w-full rounded-2xl sm:rounded-[24px] border border-zinc-200/90 bg-[#f9f9fb] p-6 sm:p-8 lg:p-9 shadow-2xs hover:border-zinc-300 hover:bg-white hover:shadow-md transition-colors duration-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8 lg:gap-10">
                          {/* 01 Index */}
                          <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0, transition: { duration: cfg.txtDuration, delay: cfg.stagger1, ease: cfg.easeOpen } }}
                            exit={{ opacity: 0, transition: { duration: cfg.opacityExitDuration } }}
                            className="font-mono text-xs sm:text-sm text-zinc-400 font-normal shrink-0 self-start lg:self-center w-8 sm:w-10"
                          >
                            {num}
                          </motion.span>

                          {/* Procedure Title & Price */}
                          <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            animate={{ opacity: 1, x: 0, transition: { duration: cfg.txtDuration, delay: cfg.stagger2, ease: cfg.easeOpen } }}
                            exit={{ opacity: 0, transition: { duration: cfg.opacityExitDuration } }}
                            className="lg:w-[30%] xl:w-[28%] shrink-0"
                          >
                            <div
                              onClick={() => toggleItem(item.id)}
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h3 className="text-xl sm:text-2xl lg:text-[28px] font-semibold tracking-tight text-black leading-snug group-hover:text-zinc-800 transition-colors">
                                {item.title}
                              </h3>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItem(item.id);
                                }}
                                className="p-1 text-black transition-transform duration-200 group-hover:scale-110 focus:outline-none lg:hidden"
                                aria-label={`Collapse ${item.title}`}
                              >
                                <ArrowUpRight className="h-6 w-6 stroke-[2]" />
                              </button>
                            </div>
                          </motion.div>

                          {/* Clinical Description & Booking Link */}
                          <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            animate={{ opacity: 1, x: 0, transition: { duration: cfg.txtDuration, delay: cfg.stagger3, ease: cfg.easeOpen } }}
                            exit={{ opacity: 0, transition: { duration: cfg.opacityExitDuration } }}
                            className="lg:flex-1 max-w-xl"
                          >
                            <p className="text-xs sm:text-[13.5px] lg:text-[14px] text-zinc-600 leading-relaxed font-normal">
                              {description}
                            </p>
                            {item.paragraphs[1] && (
                              <p className="mt-2 text-xs sm:text-[13px] text-zinc-400 leading-relaxed font-normal hidden xl:block">
                                {item.paragraphs[1]}
                              </p>
                            )}
                            <div className="mt-4 sm:mt-5">
                              <Link
                                href={`/book?treatment=${encodeURIComponent(item.title)}`}
                                className="inline-flex items-center justify-center rounded-full border border-zinc-300/90 px-5 sm:px-6 py-2 text-xs sm:text-sm font-normal text-zinc-800 bg-white hover:border-black hover:bg-black hover:text-white transition-all duration-200 active:scale-95 shadow-2xs"
                              >
                                Book this diagnostic
                              </Link>
                            </div>
                          </motion.div>

                          {/* Rounded Cinematic Thumbnail */}
                          <motion.div
                            initial={{ opacity: 0, x: -28 }}
                            animate={{ opacity: 1, x: 0, transition: { duration: cfg.imgDuration, delay: cfg.stagger4, ease: cfg.easeOpen } }}
                            exit={{ opacity: 0, transition: { duration: cfg.opacityExitDuration } }}
                            className="w-full sm:w-72 md:w-80 lg:w-72 xl:w-80 shrink-0 relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[16/10] bg-zinc-100 shadow-2xs group/img"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-500 ease-out"
                            />
                            <button
                              type="button"
                              onClick={() => toggleItem(item.id)}
                              className="hidden lg:flex absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-black transition-all shadow-xs"
                              aria-label={`Collapse ${item.title}`}
                            >
                              <ArrowUpRight className="h-5 w-5 stroke-[2]" />
                            </button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WhiteDentalTreatmentShowcase({
  mode = "treatment",
  initialTreatments,
  initialDiagnostics,
  initialShowDiagnostics,
  initialShowTreatments,
  initialSettings,
  allOpen = false,
}: {
  mode?: "both" | "diagnostic" | "treatment";
  initialTreatments?: ShowcaseItem[];
  initialDiagnostics?: ShowcaseItem[];
  initialShowDiagnostics?: boolean;
  initialShowTreatments?: boolean;
  initialSettings?: {
    showDiagnostics?: boolean;
    showTreatments?: boolean;
    treatmentHeading?: string;
    treatmentSubtitle?: string;
    diagnosticHeading?: string;
    diagnosticSubtitle?: string;
    transitionSpeed?: TransitionSpeed;
  };
  allOpen?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false });
  const [treatments, setTreatments] = useState<ShowcaseItem[]>(
    initialTreatments || TREATMENT_ITEMS
  );
  const [diagnostics, setDiagnostics] = useState<ShowcaseItem[]>(
    initialDiagnostics || DIAGNOSTIC_ITEMS
  );

  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(
    initialShowDiagnostics !== undefined
      ? initialShowDiagnostics
      : initialSettings?.showDiagnostics !== false
  );

  const [showTreatments, setShowTreatments] = useState<boolean>(
    initialShowTreatments !== undefined
      ? initialShowTreatments
      : initialSettings?.showTreatments !== false
  );

  const [treatmentHeading, setTreatmentHeading] = useState<string>(
    initialSettings?.treatmentHeading || "Treatment"
  );
  const [treatmentSubtitle, setTreatmentSubtitle] = useState<string>(
    initialSettings?.treatmentSubtitle ||
      "Each tailored treatment is an investment in your health and aesthetics. We deliver results that not only heal — but impress."
  );
  const [diagnosticHeading, setDiagnosticHeading] = useState<string>(
    initialSettings?.diagnosticHeading || "Diagnostic"
  );
  const [diagnosticSubtitle, setDiagnosticSubtitle] = useState<string>(
    initialSettings?.diagnosticSubtitle ||
      "Diagnostic methods allow us to accurately assess the condition of teeth, detect issues at early stages, and develop a personalized treatment plan"
  );
  const [transitionSpeed, setTransitionSpeed] = useState<TransitionSpeed>(
    initialSettings?.transitionSpeed || "slow"
  );

  // Sync with live admin-managed treatments store
  useEffect(() => {
    let isMounted = true;
    async function loadLiveTreatments() {
      try {
        const res = await fetch("/api/admin/treatments");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.settings) {
              if (typeof data.settings.showDiagnostics === "boolean") {
                setShowDiagnostics(data.settings.showDiagnostics);
              }
              if (typeof data.settings.showTreatments === "boolean") {
                setShowTreatments(data.settings.showTreatments);
              }
              if (data.settings.treatmentHeading) {
                setTreatmentHeading(data.settings.treatmentHeading);
              }
              if (data.settings.treatmentSubtitle) {
                setTreatmentSubtitle(data.settings.treatmentSubtitle);
              }
              if (data.settings.diagnosticHeading) {
                setDiagnosticHeading(data.settings.diagnosticHeading);
              }
              if (data.settings.diagnosticSubtitle) {
                setDiagnosticSubtitle(data.settings.diagnosticSubtitle);
              }
              if (
                data.settings.transitionSpeed &&
                ["slow", "normal", "fast"].includes(data.settings.transitionSpeed)
              ) {
                setTransitionSpeed(data.settings.transitionSpeed);
              }
            }
            if (Array.isArray(data.treatments) && data.treatments.length > 0) {
              setTreatments(data.treatments.filter((t: any) => t.isActive !== false));
            }
            if (Array.isArray(data.diagnostics) && data.diagnostics.length > 0) {
              setDiagnostics(data.diagnostics.filter((d: any) => d.isActive !== false));
            }
          }
        }
      } catch {
        // Fallback silently to initial items
      }
    }
    loadLiveTreatments();
    return () => {
      isMounted = false;
    };
  }, []);

  // Floating cursor follower circle from the video
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isInside) {
        setCursorPos({
          x: e.clientX,
          y: e.clientY,
          visible: true,
        });
      } else {
        setCursorPos((prev) => ({ ...prev, visible: false }));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      id="services-showcase"
      className="relative w-full bg-white text-black selection:bg-black selection:text-white font-sans overflow-hidden"
    >
      {/* Sleek Floating Cursor Follower Dot (matches the video recording) */}
      {cursorPos.visible && (
        <div
          className="pointer-events-none fixed z-50 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500/70 backdrop-blur-[1px] transition-transform duration-75 ease-out hidden md:block"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
          }}
          aria-hidden="true"
        />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-12 sm:py-20 lg:py-24 space-y-20 sm:space-y-28">
        {(mode === "both" || mode === "treatment") && showTreatments && (
          <ShowcaseBlock
            title={treatmentHeading}
            subtitle={treatmentSubtitle}
            items={treatments}
            defaultOpenId={null}
            speed={transitionSpeed}
            allOpen={allOpen}
          />
        )}

        {/* Diagnostic Section: modern Framer stacked cards matching spacer.framer.ai */}
        {(mode === "both" || mode === "diagnostic") && showDiagnostics && (
          <DiagnosticFramerShowcase
            title={diagnosticHeading}
            subtitle={diagnosticSubtitle}
            items={diagnostics}
            speed={transitionSpeed}
            allOpen={allOpen}
          />
        )}

        {/* Informative fallback if both sections are temporarily hidden by admin */}
        {!showTreatments && !showDiagnostics && (
          <div className="py-16 text-center border border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50 p-8">
            <h3 className="text-xl font-semibold text-zinc-800">Procedures &amp; Diagnostics Currently Updating</h3>
            <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto">
              Our clinical directory is currently undergoing scheduled updates. Please check back shortly or contact our reception.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

