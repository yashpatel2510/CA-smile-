"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  Activity,
  HeartPulse,
  ShieldCheck,
  Smile,
  Cross,
  Sparkles,
  Building2,
  Pill,
  Eye,
  Hospital,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { ClinicLogoConfig, LogoIconName } from "@/types/branding";

interface ClinicLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  configOverride?: Partial<ClinicLogoConfig>;
}

const ICON_MAP: Record<
  LogoIconName,
  React.ComponentType<{ className?: string }>
> = {
  Stethoscope,
  Activity,
  HeartPulse,
  ShieldCheck,
  Smile,
  Cross,
  Sparkles,
  Building2,
  Pill,
  Eye,
  Hospital,
};

const SIZE_CONFIGS = {
  sm: {
    container: "h-8 w-8 text-xs",
    icon: "h-4 w-4",
    img: "h-7 w-7",
  },
  md: {
    container: "h-10 w-10 text-sm",
    icon: "h-5 w-5",
    img: "h-9 w-9",
  },
  lg: {
    container: "h-12 w-12 text-base",
    icon: "h-6 w-6",
    img: "h-11 w-11",
  },
  xl: {
    container: "h-16 w-16 text-xl",
    icon: "h-8 w-8",
    img: "h-14 w-14",
  },
};

const SHAPE_MAP = {
  rounded: "rounded-clinic",
  circle: "rounded-full",
  square: "rounded-md",
};

export function ClinicLogo({
  size = "md",
  className = "",
  configOverride,
}: ClinicLogoProps) {
  const { brandConfig } = useClinicTheme();
  const [imgError, setImgError] = useState(false);

  const activeConfig: ClinicLogoConfig = {
    ...(brandConfig?.logo || {
      type: "ICON",
      iconName: "Stethoscope",
      imageUrl: "",
      monogramText: "HS",
      shape: "rounded",
      altText: "Clinic Logo",
      showClinicName: true,
      clinicDisplayName: "HealthSphere",
      tagline: "Medical Center",
    }),
    ...(configOverride || {}),
  };

  const sizeStyles = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
  const shapeStyle = SHAPE_MAP[activeConfig.shape] || SHAPE_MAP.rounded;

  const PIXEL_SIZES: Record<string, number> = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  // 1. Custom Image Logo
  if (activeConfig.type === "IMAGE" && activeConfig.imageUrl && !imgError) {
    return (
      <div
        className={`border-brand-border/40 shadow-xs flex items-center justify-center overflow-hidden border bg-brand-surface transition-transform ${sizeStyles.container} ${shapeStyle} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeConfig.imageUrl}
          alt={activeConfig.altText || "Clinic Logo"}
          width={PIXEL_SIZES[size] || 36}
          height={PIXEL_SIZES[size] || 36}
          className={`object-contain ${sizeStyles.img}`}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // 2. Monogram Text Logo
  if (activeConfig.type === "MONOGRAM") {
    const letters = (activeConfig.monogramText || "HS")
      .slice(0, 3)
      .toUpperCase();
    return (
      <div
        className={`flex items-center justify-center bg-brand-primary font-heading font-extrabold tracking-wider text-brand-primary-foreground shadow-sm transition-transform ${sizeStyles.container} ${shapeStyle} ${className}`}
      >
        <span>{letters}</span>
      </div>
    );
  }

  // 3. Clinical Icon Logo (Default / Fallback)
  const IconComponent = ICON_MAP[activeConfig.iconName] || Stethoscope;

  return (
    <div
      className={`flex items-center justify-center bg-brand-primary text-brand-primary-foreground shadow-sm transition-transform ${sizeStyles.container} ${shapeStyle} ${className}`}
    >
      <IconComponent className={sizeStyles.icon} />
    </div>
  );
}
