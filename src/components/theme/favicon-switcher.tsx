"use client";

import { useEffect, useRef } from "react";

const FAVICON_VERSION = "ca5";

/**
 * FaviconSwitcher seamlessly handles dynamic theme switching WITHOUT any color flicker
 * or flash during page refresh.
 * 
 * - On initial page load / refresh: It does NOT mutate the DOM. The browser natively
 *   picks the correct dark or light favicon via declarative media queries instantly.
 * - On dynamic theme toggle: When the user toggles dark mode or the OS theme changes,
 *   it updates the favicon link href to match the newly selected theme.
 */
export function FaviconSwitcher() {
  const lastThemeRef = useRef<"dark" | "light" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function getEffectiveTheme(): "dark" | "light" {
      return darkQuery.matches ||
        document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    }

    // Initialize baseline without mutating DOM on refresh/initial render
    lastThemeRef.current = getEffectiveTheme();

    function handleThemeChange() {
      const currentTheme = getEffectiveTheme();
      // Only mutate the DOM if the theme ACTUALLY changed during the session
      if (lastThemeRef.current === currentTheme) {
        return;
      }
      lastThemeRef.current = currentTheme;

      try {
        const isDark = currentTheme === "dark";
        const targetUrl = isDark
          ? `/favicon-dark.png?v=${FAVICON_VERSION}`
          : `/favicon-light.png?v=${FAVICON_VERSION}`;

        let dynamicLink = document.getElementById(
          "dynamic-favicon"
        ) as HTMLLinkElement | null;

        if (!dynamicLink) {
          dynamicLink = document.createElement("link");
          dynamicLink.id = "dynamic-favicon";
          dynamicLink.rel = "icon";
          dynamicLink.type = "image/png";
          document.head.appendChild(dynamicLink);
        }

        dynamicLink.href = targetUrl;
      } catch (err) {
        console.warn("Favicon dynamic switch error:", err);
      }
    }

    // Listen for OS / browser theme toggle
    if (darkQuery.addEventListener) {
      darkQuery.addEventListener("change", handleThemeChange);
    } else if ("addListener" in darkQuery) {
      (darkQuery as unknown as { addListener: (cb: () => void) => void }).addListener(handleThemeChange);
    }

    // Observe documentElement class changes (in case clinic theme provider toggles .dark)
    const observer = new MutationObserver(() => {
      handleThemeChange();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (darkQuery.removeEventListener) {
        darkQuery.removeEventListener("change", handleThemeChange);
      } else if ("removeListener" in darkQuery) {
        (darkQuery as unknown as { removeListener: (cb: () => void) => void }).removeListener(handleThemeChange);
      }
      observer.disconnect();
    };
  }, []);

  return null;
}
