"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ClinicTheme } from "@/types/theme";
import {
  clinicThemes,
  defaultThemeKey,
  generateThemeCssVariables,
  getClinicTheme,
} from "@/config/theme.config";
import { ClinicBrandConfig, DEFAULT_CLINIC_BRANDING } from "@/types/branding";

interface ClinicThemeContextValue {
  currentTheme: ClinicTheme;
  themeKey: string;
  setThemeKey: (key: string) => void;
  availableThemes: typeof clinicThemes;
  brandConfig: ClinicBrandConfig;
  updateBrandConfig: (config: Partial<ClinicBrandConfig>) => Promise<boolean>;
  resetBrandConfig: () => Promise<boolean>;
}

const ClinicThemeContext = createContext<ClinicThemeContextValue | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "healthsphere_clinic_branding_v1";

export function ClinicThemeProvider({
  children,
  initialThemeKey = defaultThemeKey,
  initialBrandConfig,
}: {
  children: React.ReactNode;
  initialThemeKey?: string;
  initialBrandConfig?: ClinicBrandConfig;
}) {
  const [themeKey, setThemeKey] = useState<string>(
    initialBrandConfig?.themeKey || initialThemeKey
  );
  const [brandConfig, setBrandConfig] = useState<ClinicBrandConfig>(
    initialBrandConfig || DEFAULT_CLINIC_BRANDING
  );

  const currentTheme = getClinicTheme(themeKey);

  // 1. Initial Load: LocalStorage Cache first (instant), then API sync
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setBrandConfig(parsed);
        if (parsed.themeKey && clinicThemes[parsed.themeKey]) {
          setThemeKey(parsed.themeKey);
        }
      }
    } catch {
      // ignore
    }

    // Fetch live from server
    fetch("/api/clinic/branding")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.branding) {
          setBrandConfig(data.branding);
          if (data.branding.themeKey && clinicThemes[data.branding.themeKey]) {
            setThemeKey(data.branding.themeKey);
          }
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(data.branding)
          );
        }
      })
      .catch((err) => {
        console.warn("Could not sync clinic branding from API:", err);
      });
  }, []);

  // 2. CSS variables applied to root
  useEffect(() => {
    const cssVars = generateThemeCssVariables(currentTheme);
    const root = document.documentElement;

    Object.entries(cssVars).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });

    root.setAttribute("data-clinic-theme", themeKey);
  }, [currentTheme, themeKey]);

  // 3. Update branding and logo
  const updateBrandConfig = async (
    partial: Partial<ClinicBrandConfig>
  ): Promise<boolean> => {
    const updated: ClinicBrandConfig = {
      ...brandConfig,
      ...partial,
      logo: {
        ...brandConfig.logo,
        ...(partial.logo || {}),
      },
      hero: {
        ...(brandConfig.hero || DEFAULT_CLINIC_BRANDING.hero!),
        ...(partial.hero || {}),
      },
      aboutSection: {
        ...(brandConfig.aboutSection || DEFAULT_CLINIC_BRANDING.aboutSection!),
        ...(partial.aboutSection || {}),
      },
      gallery: {
        ...(brandConfig.gallery || DEFAULT_CLINIC_BRANDING.gallery!),
        ...(partial.gallery || {}),
      },
      doctorIntroSection: {
        ...(brandConfig.doctorIntroSection || DEFAULT_CLINIC_BRANDING.doctorIntroSection!),
        ...(partial.doctorIntroSection || {}),
      },
      whyTrustUsSection: {
        ...(brandConfig.whyTrustUsSection || DEFAULT_CLINIC_BRANDING.whyTrustUsSection!),
        ...(partial.whyTrustUsSection || {}),
      },
    };

    // Update local state and localStorage immediately
    setBrandConfig(updated);
    if (partial.themeKey && clinicThemes[partial.themeKey]) {
      setThemeKey(partial.themeKey);
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Save to server
    try {
      const res = await fetch("/api/clinic/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      return data.success === true;
    } catch (error) {
      console.error("Failed to save clinic branding to server:", error);
      return false;
    }
  };

  // 4. Reset branding and logo
  const resetBrandConfig = async (): Promise<boolean> => {
    setBrandConfig(DEFAULT_CLINIC_BRANDING);
    setThemeKey(DEFAULT_CLINIC_BRANDING.themeKey);
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(DEFAULT_CLINIC_BRANDING)
      );
      const res = await fetch("/api/clinic/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      return data.success === true;
    } catch {
      return false;
    }
  };

  const inlineStyles = generateThemeCssVariables(
    currentTheme
  ) as React.CSSProperties;

  return (
    <ClinicThemeContext.Provider
      value={{
        currentTheme,
        themeKey,
        setThemeKey,
        availableThemes: clinicThemes,
        brandConfig,
        updateBrandConfig,
        resetBrandConfig,
      }}
    >
      <div
        style={inlineStyles}
        className="min-h-screen bg-brand-background font-body text-brand-text antialiased"
      >
        {children}
      </div>
    </ClinicThemeContext.Provider>
  );
}

export function useClinicTheme() {
  const context = useContext(ClinicThemeContext);
  if (!context) {
    throw new Error("useClinicTheme must be used within a ClinicThemeProvider");
  }
  return context;
}
