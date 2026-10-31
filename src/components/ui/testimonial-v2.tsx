"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Star, ArrowUpRight } from "lucide-react";

// --- Types ---
export interface Testimonial {
  text: string;
  image?: string;
  name: string;
  role: string;
  rating?: number;
  source?: string;
}

// --- Default Clinic Data Fallback ---
export const defaultTestimonials: Testimonial[] = [
  {
    text: "Completed session 2 of my root canal. Virtually pain-free and Dr. Deep was so gentle and reassuring throughout!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160",
    name: "Maya Patel",
    role: "Root Canal Therapy",
    rating: 5,
    source: "GOOGLE",
  },
  {
    text: "Best dental clinic in the area. Friendly environment for kids, advanced tools, and very reasonable treatment plans without unnecessary procedures.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160",
    name: "Ananya Deshmukh",
    role: "Pediatric Dental Checkup",
    rating: 5,
    source: "GOOGLE",
  },
  {
    text: "Outstanding patient experience. The clinic was immaculate, appointment was right on time, and Dr. Preeti was remarkably gentle with my veneers.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160",
    name: "Jonathan Miller",
    role: "Cosmetic Veneers & Whitening",
    rating: 5,
    source: "GOOGLE",
  },
  {
    text: "Visited for severe toothache on a Sunday morning. The clinic was immaculate and the dentist solved the problem with precision and zero pain.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160",
    name: "Kavita R. Nair",
    role: "Emergency Dental Care",
    rating: 5,
    source: "GOOGLE",
  },
  {
    text: "State-of-the-art diagnostic scans and 3D imaging. They explained the entire implant procedure clearly and the result looks completely natural.",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=160",
    name: "Margaret Sullivan",
    role: "Dental Implants",
    rating: 5,
    source: "GOOGLE",
  },
  {
    text: "Brought my 4-year-old in for dental checkup. The staff made it fun and stress-free. The WhatsApp reminder and instant confirmation was top tier.",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=160",
    name: "David K. Thornton",
    role: "Pediatric Dentistry",
    rating: 5,
    source: "GOOGLE",
  },
  {
    text: "Dr. Deep and team did an exceptional job with my clear aligners. My smile is completely transformed in 6 months!",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=160",
    name: "Sana Sheikh",
    role: "Orthodontic Aligners",
    rating: 5,
    source: "GOOGLE",
  },
  {
    text: "Gentle cleaning and scaling. No sensitivity afterwards and very transparent pricing with itemized bill.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=160",
    name: "Farhan Siddiqui",
    role: "Preventative Scaling & Polish",
    rating: 5,
    source: "GOOGLE",
  },
  {
    text: "Exceptional hygiene standards and modern sterilization protocols. Highly recommend to anyone seeking trusted dental care.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160",
    name: "Aliza Khan",
    role: "Crowns & Bridges",
    rating: 5,
    source: "GOOGLE",
  },
];

// --- Sub-Components ---
export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-4 pb-4 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(
                ({ text, image, name, role, rating, source }, i) => (
                  <motion.li
                    key={`${index}-${i}`}
                    aria-hidden={index === 1 ? "true" : "false"}
                    tabIndex={index === 1 ? -1 : 0}
                    whileHover={{
                      scale: 1.03,
                      y: -8,
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.1)",
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      },
                    }}
                    whileFocus={{
                      scale: 1.03,
                      y: -8,
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.1)",
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      },
                    }}
                    className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md shadow-black/5 w-full bg-white dark:bg-neutral-900 transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <blockquote className="m-0 p-0">
                      {rating ? (
                        <div className="flex items-center gap-1 text-amber-400 mb-2.5">
                          {[...Array(rating)].map((_, r) => (
                            <Star key={r} className="h-3.5 w-3.5 fill-current" />
                          ))}
                          {source === "GOOGLE" && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              <svg className="h-3 w-3" viewBox="0 0 24 24">
                                <path
                                  fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                              </svg>
                              Google
                            </span>
                          )}
                        </div>
                      ) : null}

                      <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal m-0 transition-colors duration-300 text-xs sm:text-sm italic">
                        &ldquo;{text}&rdquo;
                      </p>
                      <footer className="flex items-center gap-2.5 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        {image ? (
                          <img
                            width={40}
                            height={40}
                            src={image}
                            alt={`Avatar of ${name}`}
                            loading="lazy"
                            decoding="async"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-800 group-hover:ring-primary/30 transition-all duration-300 ease-in-out"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 text-white font-semibold text-sm flex items-center justify-center ring-2 ring-neutral-100 dark:ring-neutral-800">
                            {name ? name.charAt(0).toUpperCase() : "P"}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <cite className="font-semibold not-italic tracking-tight leading-5 text-neutral-900 dark:text-white transition-colors duration-300">
                            {name}
                          </cite>
                          <span className="text-xs leading-5 tracking-tight text-neutral-500 dark:text-neutral-400 mt-0.5 transition-colors duration-300">
                            {role}
                          </span>
                        </div>
                      </footer>
                    </blockquote>
                  </motion.li>
                )
              )}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

export interface TestimonialsSectionProps {
  testimonialsList?: Testimonial[];
  title?: string;
  logoUrl?: string;
  googleMapsUrl?: string;
  showToggle?: boolean;
  defaultDark?: boolean;
  showEmptyCard?: boolean;
}

export const TestimonialsSection = ({
  testimonialsList,
  title = "What Our Patients Say",
  logoUrl,
  googleMapsUrl = "https://www.google.com/search?q=ca+smile+dental+clinic+reviwe+add+&sca_esv=83f148050a27f47b&rlz=1C5CHFA_enIN1171IN1171&sxsrf=AKL5yDikO_PUx2STXoM9NQgdeFsuQnPmkQ%3A1793449673912&ei=yd7laoSVN7GVhvcPiobT2Qs&biw=1470&bih=723&uact=5&oq=ca+smile+dental+clinic+reviwe+add+&gs_lp=Egxnd3Mtd2l6LXNlcnAiImNhIHNtaWxlIGRlbnRhbCBjbGluaWMgcmV2aXdlIGFkZCAyBxAhGAoYoAEyBxAhGAoYoAEyBxAhGAoYoAEyBxAhGAoYoAFI8ThQ0wNY8S9wAXgBkAEAmAHqAqABtCaqAQYyLTE4LjG4AQPIAQD4AQGYAhSgArgnwgIKEAAYRxjWBBiwA8ICDRAAGEcY1gQYyQMYsAPCAgYQABgWGB7CAgcQABiABBgNwgILEAAYgAQYigUYhgPCAggQABiABBiiBMICBRAAGO8FwgIGEAAYHhgNwgIFECEYnwXCAgUQIRigAcICBBAhGBWYAwCIBgGQBgiSBwgxLjAuMTguMaAH9G6yBwYyLTE4LjG4B7EnwgcGMC45LjExyAdEgAgB&sclient=gws-wiz-serp#lrd=0x3be0ef543648830b:0x3a288255f324c8de,3,,,,",
  showToggle = false,
  defaultDark = false,
  showEmptyCard = true,
}: TestimonialsSectionProps) => {
  const [isDark, setIsDark] = useState(defaultDark);

  useEffect(() => {
    setIsDark(defaultDark);
  }, [defaultDark]);

  const hasReviews = Boolean(testimonialsList && testimonialsList.length > 0);

  // If there are no reviews and admin configured to hide the empty card, return null
  if (!hasReviews && !showEmptyCard) {
    return null;
  }

  const activeList = hasReviews ? testimonialsList! : [];

  const colSize = Math.max(1, Math.ceil(activeList.length / 3));
  const firstColumn = activeList.slice(0, colSize);
  const secondColumn = activeList.slice(colSize, colSize * 2);
  const thirdColumn = activeList.slice(colSize * 2);

  const finalFirst = firstColumn.length ? firstColumn : activeList;
  const finalSecond = secondColumn.length ? secondColumn : activeList;
  const finalThird = thirdColumn.length ? thirdColumn : activeList;

  return (
    <div className={isDark ? "dark" : ""}>
      <section
        id="testimonials-section-inner"
        aria-labelledby="testimonials-heading"
        className="relative overflow-hidden bg-background dark:bg-neutral-950 text-brand-text dark:text-neutral-100 pt-8 sm:pt-12 md:pt-14 pb-14 sm:pb-20 transition-colors duration-300 scroll-mt-28 border-0"
      >
        {/* Floating Dark Mode Toggle (optional) */}
        {showToggle && (
          <button
            onClick={() => setIsDark(!isDark)}
            className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 shadow-md hover:scale-105 transition-all"
            aria-label="Toggle Dark Mode"
            title="Toggle Review Section Dark Mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {/* Ambient Top Vignette for seamless dark atmosphere */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-neutral-950 via-neutral-950/60 to-transparent z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="w-full max-w-6xl px-3.5 sm:px-6 z-10 mx-auto"
        >
          <div className="flex flex-col items-center justify-center max-w-[620px] mx-auto mb-6 text-center">
            <h2
              id="testimonials-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-center text-neutral-900 dark:text-white transition-colors"
            >
              {title}
            </h2>

            {/* When reviews exist, show the top Google button */}
            {hasReviews && googleMapsUrl && (
              <div className="mt-4 sm:mt-5 flex justify-center">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-surface dark:bg-neutral-900 px-4 py-2 text-xs sm:text-sm font-semibold text-brand-text dark:text-neutral-200 shadow-sm hover:border-brand-primary hover:text-brand-primary dark:hover:text-white hover:shadow-md transition-all duration-200 group"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Add Google Review</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand-muted group-hover:text-brand-primary transition-colors" />
                </a>
              </div>
            )}
          </div>

          {hasReviews ? (
            /* Animated 3-Column Reviews When Reviews Exist */
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] max-h-[460px] sm:max-h-[500px] lg:max-h-[520px] overflow-hidden w-full"
              role="region"
              aria-label="Scrolling Testimonials"
            >
              <TestimonialsColumn testimonials={finalFirst} duration={16} className="w-full" />
              <TestimonialsColumn
                testimonials={finalSecond}
                className="hidden md:block w-full"
                duration={21}
              />
              <TestimonialsColumn
                testimonials={finalThird}
                className="hidden lg:block w-full"
                duration={18}
              />
            </div>
          ) : (
            /* Single "Add Your Review" Card for New Clinic */
            <div className="mt-8 flex justify-center">
              <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 p-8 sm:p-10 text-center shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  Share Your Dental Experience
                </h3>

                <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                  Our clinic is brand new! We would love to hear your feedback. Your review helps us continue delivering gentle, exceptional dental care.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-7 py-3 text-xs sm:text-sm font-semibold text-white shadow-md hover:from-teal-600 hover:to-emerald-700 hover:shadow-lg hover:scale-105 transition-all w-full sm:w-auto group"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#ffffff"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#ffffff"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#ffffff"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#ffffff"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Add Review on Google</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>

                <p className="mt-3.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                  Takes less than a minute • Directly opens Google Reviews
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Ambient Bottom Gradient to ensure zero light leakage */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent z-10" />
      </section>
    </div>
  );
};

export default function TestimonialV2(props: TestimonialsSectionProps) {
  return <TestimonialsSection {...props} />;
}
