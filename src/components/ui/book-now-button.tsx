"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContactModal } from "@/components/public/contact-modal";

export interface BookNowButtonProps {
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  "aria-label"?: string;
}

export const BookNowButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BookNowButtonProps
>(
  (
    {
      href,
      onClick,
      text = "Book Now",
      className,
      size = "md",
      target,
      rel,
      type = "button",
      disabled = false,
      loading = false,
      fullWidth = false,
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const pathname = usePathname();
    const { openContactModal } = useContactModal();

    const handleInterceptClick = (e: React.MouseEvent) => {
      if (onClick) {
        onClick(e);
      }
      if (
        !e.defaultPrevented &&
        href &&
        (href === "/contact" || href.startsWith("/contact?"))
      ) {
        if (pathname !== "/contact") {
          e.preventDefault();
          let service: string | undefined;
          try {
            if (href.includes("?")) {
              const params = new URLSearchParams(href.split("?")[1]);
              service =
                params.get("treatment") ||
                params.get("service") ||
                undefined;
            }
          } catch (_) {}
          openContactModal({ service });
        }
      }
    };
    const sizeConfig = {
      sm: {
        container: "h-9 pl-4 pr-1.5 gap-2.5 text-xs rounded-xl",
        iconBox: "h-6 w-6 rounded-md",
        icon: "h-3.5 w-3.5",
      },
      md: {
        container: "h-11 pl-5 pr-2 gap-3.5 text-xs sm:text-sm rounded-xl",
        iconBox: "h-7 w-7 sm:h-7 sm:w-7 rounded-lg",
        icon: "h-4 w-4",
      },
      lg: {
        container:
          "h-12 sm:h-13 pl-6 pr-2.5 gap-4 text-sm sm:text-base rounded-2xl",
        iconBox: "h-8 w-8 sm:h-9 sm:w-9 rounded-xl",
        icon: "h-4.5 w-4.5",
      },
    };

    const currentSize = sizeConfig[size];

    const baseClasses = cn(
      "group relative inline-flex items-center justify-between font-medium text-white transition-all duration-200 select-none shadow-md",
      "bg-[#881318] hover:bg-[#99171d] active:scale-[0.98]",
      "border border-[#5c080d]/60 shadow-red-950/30",
      fullWidth ? "w-full" : "w-auto",
      (disabled || loading) && "opacity-60 pointer-events-none cursor-not-allowed",
      currentSize.container,
      className
    );

    const innerContent = (
      <>
        <span className="font-heading font-semibold tracking-wide text-white">
          {text}
        </span>
        <span
          className={cn(
            "shadow-xs flex shrink-0 items-center justify-center bg-white text-[#881318] transition-transform duration-200 group-hover:translate-x-0.5",
            currentSize.iconBox
          )}
          aria-hidden="true"
        >
          {loading ? (
            <Loader2
              className={cn(
                "animate-spin stroke-[2.2] text-[#881318]",
                currentSize.icon
              )}
            />
          ) : (
            <ArrowRight
              className={cn(
                "stroke-[2.2] text-[#881318] transition-colors",
                currentSize.icon
              )}
            />
          )}
        </span>
      </>
    );

    if (href) {
      if (
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:")
      ) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            onClick={onClick}
            target={target}
            rel={rel}
            className={baseClasses}
            aria-label={ariaLabel || text}
          >
            {innerContent}
          </a>
        );
      }

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={handleInterceptClick}
          target={target}
          rel={rel}
          className={baseClasses}
          aria-label={ariaLabel || text}
        >
          {innerContent}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        onClick={handleInterceptClick}
        disabled={disabled || loading}
        className={baseClasses}
        aria-label={ariaLabel || text}
      >
        {innerContent}
      </button>
    );
  }
);

BookNowButton.displayName = "BookNowButton";
