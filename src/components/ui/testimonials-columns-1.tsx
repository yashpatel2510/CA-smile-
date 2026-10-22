"use client";

import React from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";

export interface TestimonialItem {
  text: string;
  image?: string;
  name: string;
  role: string;
  rating?: number;
  source?: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: TestimonialItem[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role, rating, source }, i) => (
                <div
                  className="p-8 sm:p-10 rounded-3xl border border-border/80 bg-surface shadow-lg shadow-primary/5 hover:shadow-primary/15 transition-all max-w-xs sm:max-w-sm w-full"
                  key={`${index}-${i}`}
                >
                  {rating ? (
                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                      {[...Array(rating)].map((_, r) => (
                        <Star key={r} className="h-4 w-4 fill-current" />
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

                  <div className="text-sm sm:text-base leading-relaxed text-brand-text/90 italic">
                    &ldquo;{text}&rdquo;
                  </div>

                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/50">
                    {image ? (
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 text-white font-semibold text-sm flex items-center justify-center ring-2 ring-primary/20">
                        {name ? name.charAt(0).toUpperCase() : "P"}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="font-semibold tracking-tight text-sm text-brand-text">
                        {name}
                      </div>
                      <div className="text-xs text-brand-muted tracking-tight">
                        {role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
