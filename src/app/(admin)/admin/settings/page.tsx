"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Shield,
  Trash2,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Palette,
  Type,
  MapPin,
  Clock,
  ChevronDown,
  MousePointerClick,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  UserCheck,
  Star,
  Layers,
  Sliders,
  SlidersHorizontal,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Hero } from "@/components/design-system/hero";
import { DEFAULT_HERO_CONFIG, HeroSectionConfig } from "@/types/branding";

function ToothVectorIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.5 2C4.5 2 2.5 4.2 2.5 7.2c0 2.4 1.1 4.8 2.1 7.2.9 2.3 1.9 5.6 3.4 5.6 1.4 0 1.8-3 4-3s2.6 3 4 3c1.5 0 2.5-3.3 3.4-5.6 1-2.4 2.1-4.8 2.1-7.2 0-3-2-5.2-5-5.2-1.9 0-3.3 1-4.5 2.2C10.8 3 9.4 2 7.5 2z" />
    </svg>
  );
}

const BG_COLOR_PRESETS = [
  { label: "Soft Off-White", value: "#f8f9fa" },
  { label: "Default Soft Gray", value: "#f4f4f5" },
  { label: "Pure White", value: "#ffffff" },
  { label: "Sleek Dark", value: "#18181b" },
  { label: "Soft Mint", value: "#f0fdf4" },
  { label: "Ice Blue", value: "#f0f9ff" },
  { label: "Warm Ivory", value: "#fafaf9" },
];

const TEXT_COLOR_PRESETS = [
  { label: "Deep Charcoal", value: "#0f172a" },
  { label: "Charcoal Gray", value: "#18181b" },
  { label: "Pure Black", value: "#000000" },
  { label: "Pure White", value: "#ffffff" },
  { label: "Slate Muted", value: "#475569" },
];

const CTA_BTN_BG_PRESETS = [
  { label: "Modern Black", value: "#050505" },
  { label: "Deep Charcoal", value: "#18181b" },
  { label: "Royal Blue", value: "#2563eb" },
  { label: "Emerald Green", value: "#059669" },
  { label: "Teal Serenity", value: "#0d9488" },
  { label: "Crimson Red", value: "#dc2626" },
  { label: "Pure White", value: "#ffffff" },
];

const CTA_BTN_TEXT_PRESETS = [
  { label: "Pure White", value: "#ffffff" },
  { label: "Pure Black", value: "#000000" },
  { label: "Charcoal", value: "#18181b" },
  { label: "Slate Gray", value: "#334155" },
];

export default function AdminSettingsPage() {
  const { brandConfig, updateBrandConfig, resetBrandConfig } = useClinicTheme();

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"hero" | "header" | "details">("hero");

  // Preview Viewport Mode State
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // =========================================================================
  // 1. HEADER BRANDING STATE
  // =========================================================================
  const [clinicDisplayName, setClinicDisplayName] = useState(
    brandConfig.logo?.clinicDisplayName || brandConfig.clinicName || "PedioDent"
  );
  const [headerBgColor, setHeaderBgColor] = useState(
    brandConfig.headerBgColor || "#f4f4f5"
  );
  const [headerTextColor, setHeaderTextColor] = useState(
    brandConfig.headerTextColor || "#18181b"
  );
  const [headerContactBtnBgColor, setHeaderContactBtnBgColor] = useState(
    brandConfig.headerContactBtnBgColor || "#000000"
  );
  const [headerContactBtnTextColor, setHeaderContactBtnTextColor] = useState(
    brandConfig.headerContactBtnTextColor || "#ffffff"
  );
  const [logoImageUrl, setLogoImageUrl] = useState(
    brandConfig.logo?.imageUrl || ""
  );

  // =========================================================================
  // 2. HERO SECTION STATE
  // =========================================================================
  const initialHero = brandConfig.hero || DEFAULT_HERO_CONFIG;

  // 2-top. Top Information Row (Working hours on left, Location on right)
  const [heroTopInfoEnabled, setHeroTopInfoEnabled] = useState(
    initialHero.topInfoEnabled !== false
  );
  const [heroTopInfoWorkingHoursLabel, setHeroTopInfoWorkingHoursLabel] = useState(
    initialHero.topInfoWorkingHoursLabel || "Working hours"
  );
  const [heroTopInfoWorkingHoursValue, setHeroTopInfoWorkingHoursValue] = useState(
    initialHero.topInfoWorkingHoursValue || "Mon - Sat 8:00-20:00"
  );
  const [heroTopInfoLocationLabel, setHeroTopInfoLocationLabel] = useState(
    initialHero.topInfoLocationLabel || "Location"
  );
  const [heroTopInfoLocationValue, setHeroTopInfoLocationValue] = useState(
    initialHero.topInfoLocationValue || "12 Shevchenko Street, Kyiv"
  );
  const [heroTopInfoTextColor, setHeroTopInfoTextColor] = useState(
    initialHero.topInfoTextColor || "#18181b"
  );
  const [heroTopInfoLabelColor, setHeroTopInfoLabelColor] = useState(
    initialHero.topInfoLabelColor || "#64748b"
  );
  const [heroTopInfoMarginTop, setHeroTopInfoMarginTop] = useState(
    initialHero.topInfoMarginTop || "0px"
  );

  // 2a. Upper Grand Title ("DENTAL CARE")
  const [heroUpperText, setHeroUpperText] = useState(
    initialHero.upperText || "DENTAL CARE"
  );
  const [heroUpperTextColor, setHeroUpperTextColor] = useState(
    initialHero.upperTextColor || "#000000"
  );
  const [heroUpperTextLetterSpacing, setHeroUpperTextLetterSpacing] = useState(
    initialHero.upperTextLetterSpacing || "0.14em"
  );
  const [heroShowUpperText, setHeroShowUpperText] = useState(
    initialHero.showUpperText !== false
  );

  // 2b. Hero Doctor Cutout & Canvas
  const [heroImageUrl, setHeroImageUrl] = useState(
    initialHero.imageUrl || "/images/hero-doctor-dental-care.png"
  );
  const [heroMobileImageUrl, setHeroMobileImageUrl] = useState(
    initialHero.mobileImageUrl || "/images/hero-doctor-mobile.png"
  );
  const [heroMobileImageFit, setHeroMobileImageFit] = useState<"cover" | "contain" | "fill">(
    initialHero.mobileImageFit || "cover"
  );
  const [heroMobileImageHeight, setHeroMobileImageHeight] = useState(
    initialHero.mobileImageHeight || "440px"
  );
  const [heroMobileImageWidth, setHeroMobileImageWidth] = useState(
    initialHero.mobileImageWidth || "100%"
  );
  const [heroMobileImageFullWidth, setHeroMobileImageFullWidth] = useState(
    initialHero.mobileImageFullWidth !== false
  );
  const [heroMobileImageBottomFade, setHeroMobileImageBottomFade] = useState(
    initialHero.mobileImageBottomFade !== false
  );
  const [heroImageAltText, setHeroImageAltText] = useState(
    initialHero.imageAltText || "Dental Care Specialist Doctor"
  );
  const [heroImageWidth, setHeroImageWidth] = useState(
    initialHero.imageWidth || "560px"
  );
  const [heroImageHeight, setHeroImageHeight] = useState(
    initialHero.imageHeight || "560px"
  );
  const [heroImageBorderRadius, setHeroImageBorderRadius] = useState(
    initialHero.imageBorderRadius || "0px"
  );
  const [heroImageFit, setHeroImageFit] = useState<"cover" | "contain">(
    initialHero.imageFit || "cover"
  );
  const [heroHeroMinHeight, setHeroHeroMinHeight] = useState(
    initialHero.heroMinHeight || "620px"
  );
  const [heroImageOverlayOpacity, setHeroImageOverlayOpacity] = useState<number>(
    initialHero.imageOverlayOpacity ?? 0.12
  );
  const [heroImageBottomFade, setHeroImageBottomFade] = useState(
    initialHero.imageBottomFade !== false
  );
  const [heroBackgroundColor, setHeroBackgroundColor] = useState(
    initialHero.backgroundColor || "#ffffff"
  );
  const [heroShowAuraCircle, setHeroShowAuraCircle] = useState(
    initialHero.showAuraCircle !== false
  );
  const [heroAuraCircleColor, setHeroAuraCircleColor] = useState(
    initialHero.auraCircleColor || "#d1d5db"
  );

  // 2c. Subtitle & Appointment Button
  const [heroSubtitleText, setHeroSubtitleText] = useState(
    initialHero.subtitleText ||
      "Discover advanced care, personalized treatments, and trusted experts in a gentle, modern environment"
  );
  const [heroSubtitleTextColor, setHeroSubtitleTextColor] = useState(
    initialHero.subtitleTextColor || "#475569"
  );
  const [heroSubtitleBoxMarginTop, setHeroSubtitleBoxMarginTop] = useState(
    initialHero.subtitleBoxMarginTop || "0px"
  );
  const [heroSubtitleBoxMarginBottom, setHeroSubtitleBoxMarginBottom] = useState(
    initialHero.subtitleBoxMarginBottom || "0px"
  );
  const [heroCtaButtonText, setHeroCtaButtonText] = useState(
    initialHero.ctaButtonText || "Book Your Appointment"
  );
  const [heroCtaButtonUrl, setHeroCtaButtonUrl] = useState(
    initialHero.ctaButtonUrl || "/contact"
  );
  const [heroCtaButtonBgColor, setHeroCtaButtonBgColor] = useState(
    initialHero.ctaButtonBgColor || "#050505"
  );
  const [heroCtaButtonTextColor, setHeroCtaButtonTextColor] = useState(
    initialHero.ctaButtonTextColor || "#ffffff"
  );
  const [heroCtaButtonBorderRadius, setHeroCtaButtonBorderRadius] = useState(
    initialHero.ctaButtonBorderRadius || "14px"
  );
  const [heroCtaButtonShowIcon, setHeroCtaButtonShowIcon] = useState(
    initialHero.ctaButtonShowIcon !== false
  );
  const [heroCtaButtonStyle, setHeroCtaButtonStyle] = useState<
    "badge-arrow" | "classic"
  >(initialHero.ctaButtonStyle || "badge-arrow");
  const [heroCtaButtonBadgeBgColor, setHeroCtaButtonBadgeBgColor] = useState(
    initialHero.ctaButtonBadgeBgColor || "#ffffff"
  );
  const [heroCtaButtonBadgeIconColor, setHeroCtaButtonBadgeIconColor] = useState(
    initialHero.ctaButtonBadgeIconColor || ""
  );

  // 2d. Floating Doctor Info Card
  const [heroDoctorBoxEnabled, setHeroDoctorBoxEnabled] = useState(
    initialHero.doctorBoxEnabled !== false
  );
  const [heroDoctorBoxName, setHeroDoctorBoxName] = useState(
    initialHero.doctorBoxName || "Dr. Alex Mercer"
  );
  const [heroDoctorBoxRole, setHeroDoctorBoxRole] = useState(
    initialHero.doctorBoxRole || "Senior Dental Specialist"
  );
  const [heroDoctorBoxShowRole, setHeroDoctorBoxShowRole] = useState(
    initialHero.doctorBoxShowRole !== false
  );
  const [heroDoctorBoxExperience, setHeroDoctorBoxExperience] = useState(
    initialHero.doctorBoxExperience || "8+ Years of Experience (4.9 ★ Rating)"
  );
  const [heroDoctorBoxShowExperience, setHeroDoctorBoxShowExperience] = useState(
    initialHero.doctorBoxShowExperience !== false
  );
  const [heroDoctorBoxPhotoUrl, setHeroDoctorBoxPhotoUrl] = useState(
    initialHero.doctorBoxPhotoUrl ||
      initialHero.imageUrl ||
      "/images/hero-doctor-dental-care.png"
  );
  const [heroDoctorBoxShowPhoto, setHeroDoctorBoxShowPhoto] = useState(
    initialHero.doctorBoxShowPhoto !== false
  );
  const [heroDoctorBoxBgColor, setHeroDoctorBoxBgColor] = useState(
    initialHero.doctorBoxBgColor || "rgba(148, 153, 162, 0.92)"
  );
  const [heroDoctorBoxTextColor, setHeroDoctorBoxTextColor] = useState(
    initialHero.doctorBoxTextColor || "#ffffff"
  );
  const [heroDoctorBoxBorderRadius, setHeroDoctorBoxBorderRadius] = useState(
    initialHero.doctorBoxBorderRadius || "20px"
  );
  const [heroDoctorBoxMarginTop, setHeroDoctorBoxMarginTop] = useState(
    initialHero.doctorBoxMarginTop || "0px"
  );
  const [heroDoctorBoxMarginBottom, setHeroDoctorBoxMarginBottom] = useState(
    initialHero.doctorBoxMarginBottom || "0px"
  );

  // Optional Clinic Location Fields
  const [clinicAddress, setClinicAddress] = useState(brandConfig.address || "");
  const [clinicPhone, setClinicPhone] = useState(brandConfig.phone || "");
  const [latitude, setLatitude] = useState(brandConfig.latitude ?? 10.01586);
  const [longitude, setLongitude] = useState(brandConfig.longitude ?? 76.34186);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const mobileHeroImageInputRef = useRef<HTMLInputElement>(null);
  const doctorAvatarInputRef = useRef<HTMLInputElement>(null);

  // Sync state if brandConfig updates from server
  useEffect(() => {
    if (brandConfig) {
      setClinicDisplayName(
        brandConfig.logo?.clinicDisplayName ||
          brandConfig.clinicName ||
          "PedioDent"
      );
      setHeaderBgColor(brandConfig.headerBgColor || "#f4f4f5");
      setHeaderTextColor(brandConfig.headerTextColor || "#18181b");
      setHeaderContactBtnBgColor(
        brandConfig.headerContactBtnBgColor || "#000000"
      );
      setHeaderContactBtnTextColor(
        brandConfig.headerContactBtnTextColor || "#ffffff"
      );
      setLogoImageUrl(brandConfig.logo?.imageUrl || "");
      setClinicAddress(brandConfig.address || "");
      setClinicPhone(brandConfig.phone || "");
      setLatitude(brandConfig.latitude ?? 10.01586);
      setLongitude(brandConfig.longitude ?? 76.34186);

      if (brandConfig.hero) {
        const h = brandConfig.hero;
        setHeroTopInfoEnabled(h.topInfoEnabled !== false);
        setHeroTopInfoWorkingHoursLabel(h.topInfoWorkingHoursLabel || "Working hours");
        setHeroTopInfoWorkingHoursValue(h.topInfoWorkingHoursValue || "Mon - Sat 8:00-20:00");
        setHeroTopInfoLocationLabel(h.topInfoLocationLabel || "Location");
        setHeroTopInfoLocationValue(h.topInfoLocationValue || "12 Shevchenko Street, Kyiv");
        setHeroTopInfoTextColor(h.topInfoTextColor || "#18181b");
        setHeroTopInfoLabelColor(h.topInfoLabelColor || "#64748b");
        setHeroTopInfoMarginTop(h.topInfoMarginTop || "0px");
        setHeroUpperText(h.upperText || "DENTAL CARE");
        setHeroUpperTextColor(h.upperTextColor || "#000000");
        setHeroUpperTextLetterSpacing(h.upperTextLetterSpacing || "0.14em");
        setHeroShowUpperText(h.showUpperText !== false);
        setHeroImageUrl(h.imageUrl || "/images/hero-doctor-dental-care.png");
        setHeroMobileImageUrl(
          h.mobileImageUrl || "/images/hero-doctor-mobile.png"
        );
        setHeroMobileImageFit(h.mobileImageFit || "cover");
        setHeroMobileImageHeight(h.mobileImageHeight || "440px");
        setHeroMobileImageWidth(h.mobileImageWidth || "100%");
        setHeroMobileImageFullWidth(h.mobileImageFullWidth !== false);
        setHeroMobileImageBottomFade(h.mobileImageBottomFade !== false);
        setHeroImageAltText(h.imageAltText || "Dental Care Specialist Doctor");
        setHeroImageWidth(h.imageWidth || "560px");
        setHeroImageHeight(h.imageHeight || "560px");
        setHeroImageBorderRadius(h.imageBorderRadius || "0px");
        setHeroImageFit(h.imageFit || "cover");
        setHeroHeroMinHeight(h.heroMinHeight || "620px");
        setHeroImageOverlayOpacity(h.imageOverlayOpacity ?? 0.12);
        setHeroImageBottomFade(h.imageBottomFade !== false);
        setHeroBackgroundColor(h.backgroundColor || "#ffffff");
        setHeroShowAuraCircle(h.showAuraCircle !== false);
        setHeroAuraCircleColor(h.auraCircleColor || "#d1d5db");
        setHeroSubtitleText(
          h.subtitleText ||
            "Discover advanced care, personalized treatments, and trusted experts in a gentle, modern environment"
        );
        setHeroSubtitleTextColor(h.subtitleTextColor || "#475569");
        setHeroSubtitleBoxMarginTop(h.subtitleBoxMarginTop || "0px");
        setHeroSubtitleBoxMarginBottom(h.subtitleBoxMarginBottom || "0px");
        setHeroCtaButtonText(h.ctaButtonText || "Book Your Appointment");
        setHeroCtaButtonUrl(h.ctaButtonUrl || "/contact");
        setHeroCtaButtonBgColor(h.ctaButtonBgColor || "#050505");
        setHeroCtaButtonTextColor(h.ctaButtonTextColor || "#ffffff");
        setHeroCtaButtonBorderRadius(h.ctaButtonBorderRadius || "14px");
        setHeroCtaButtonShowIcon(h.ctaButtonShowIcon !== false);
        setHeroCtaButtonStyle(h.ctaButtonStyle || "badge-arrow");
        setHeroCtaButtonBadgeBgColor(h.ctaButtonBadgeBgColor || "#ffffff");
        setHeroCtaButtonBadgeIconColor(h.ctaButtonBadgeIconColor || "");
        setHeroDoctorBoxEnabled(h.doctorBoxEnabled !== false);
        setHeroDoctorBoxName(h.doctorBoxName || "Dr. Alex Mercer");
        setHeroDoctorBoxRole(h.doctorBoxRole || "Senior Dental Specialist");
        setHeroDoctorBoxShowRole(h.doctorBoxShowRole !== false);
        setHeroDoctorBoxExperience(
          h.doctorBoxExperience || "8+ Years of Experience (4.9 ★ Rating)"
        );
        setHeroDoctorBoxShowExperience(h.doctorBoxShowExperience !== false);
        setHeroDoctorBoxPhotoUrl(
          h.doctorBoxPhotoUrl ||
            h.imageUrl ||
            "/images/hero-doctor-dental-care.png"
        );
        setHeroDoctorBoxShowPhoto(h.doctorBoxShowPhoto !== false);
        setHeroDoctorBoxBgColor(
          h.doctorBoxBgColor || "rgba(148, 153, 162, 0.92)"
        );
        setHeroDoctorBoxTextColor(h.doctorBoxTextColor || "#ffffff");
        setHeroDoctorBoxBorderRadius(h.doctorBoxBorderRadius || "20px");
        setHeroDoctorBoxMarginTop(h.doctorBoxMarginTop || "0px");
        setHeroDoctorBoxMarginBottom(h.doctorBoxMarginBottom || "0px");
      }
    }
  }, [brandConfig]);

  // Handle Logo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, SVG, JPG, WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Image file size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoImageUrl(dataUrl);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Hero Image Upload
  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, WebP, JPG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Hero image file size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setHeroImageUrl(dataUrl);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Mobile Hero Image Upload
  const handleMobileHeroImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, WebP, JPG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Mobile image file size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setHeroMobileImageUrl(dataUrl);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Doctor Avatar Upload
  const handleDoctorAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setHeroDoctorBoxPhotoUrl(dataUrl);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Live Hero Config Object for real-time preview
  const liveHeroConfig: HeroSectionConfig = {
    topInfoEnabled: heroTopInfoEnabled,
    topInfoWorkingHoursLabel: heroTopInfoWorkingHoursLabel,
    topInfoWorkingHoursValue: heroTopInfoWorkingHoursValue,
    topInfoLocationLabel: heroTopInfoLocationLabel,
    topInfoLocationValue: heroTopInfoLocationValue,
    topInfoTextColor: heroTopInfoTextColor,
    topInfoLabelColor: heroTopInfoLabelColor,
    topInfoMarginTop: heroTopInfoMarginTop,
    upperText: heroUpperText,
    upperTextColor: heroUpperTextColor,
    upperTextLetterSpacing: heroUpperTextLetterSpacing,
    showUpperText: heroShowUpperText,
    imageUrl: heroImageUrl,
    mobileImageUrl: heroMobileImageUrl,
    mobileImageFit: heroMobileImageFit,
    mobileImageHeight: heroMobileImageHeight,
    mobileImageWidth: heroMobileImageWidth,
    mobileImageFullWidth: heroMobileImageFullWidth,
    mobileImageBottomFade: heroMobileImageBottomFade,
    imageAltText: heroImageAltText,
    imageWidth: heroImageWidth,
    imageHeight: heroImageHeight,
    imageBorderRadius: heroImageBorderRadius,
    imageFit: heroImageFit,
    heroMinHeight: heroHeroMinHeight,
    imageOverlayOpacity: heroImageOverlayOpacity,
    imageBottomFade: heroImageBottomFade,
    backgroundColor: heroBackgroundColor,
    showAuraCircle: false,
    auraCircleColor: "#d1d5db",
    subtitleText: heroSubtitleText,
    subtitleTextColor: heroSubtitleTextColor,
    subtitleBoxMarginTop: heroSubtitleBoxMarginTop,
    subtitleBoxMarginBottom: heroSubtitleBoxMarginBottom,
    ctaButtonText: heroCtaButtonText,
    ctaButtonUrl: heroCtaButtonUrl,
    ctaButtonBgColor: heroCtaButtonBgColor,
    ctaButtonTextColor: heroCtaButtonTextColor,
    ctaButtonBorderRadius: heroCtaButtonBorderRadius,
    ctaButtonShowIcon: heroCtaButtonShowIcon,
    ctaButtonStyle: heroCtaButtonStyle,
    ctaButtonBadgeBgColor: heroCtaButtonBadgeBgColor,
    ctaButtonBadgeIconColor: heroCtaButtonBadgeIconColor,
    doctorBoxEnabled: heroDoctorBoxEnabled,
    doctorBoxName: heroDoctorBoxName,
    doctorBoxRole: heroDoctorBoxRole,
    doctorBoxShowRole: heroDoctorBoxShowRole,
    doctorBoxExperience: heroDoctorBoxExperience,
    doctorBoxShowExperience: heroDoctorBoxShowExperience,
    doctorBoxPhotoUrl: heroDoctorBoxPhotoUrl,
    doctorBoxShowPhoto: heroDoctorBoxShowPhoto,
    doctorBoxBgColor: heroDoctorBoxBgColor,
    doctorBoxTextColor: heroDoctorBoxTextColor,
    doctorBoxBorderRadius: heroDoctorBoxBorderRadius,
    doctorBoxMarginTop: heroDoctorBoxMarginTop,
    doctorBoxMarginBottom: heroDoctorBoxMarginBottom,
  };

  // Save All Changes (Header + Hero)
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    const ok = await updateBrandConfig({
      ...brandConfig,
      clinicName: clinicDisplayName.trim() || "PedioDent",
      headerBgColor: headerBgColor.trim() || "#f4f4f5",
      headerTextColor: headerTextColor.trim() || "#18181b",
      headerContactBtnBgColor: headerContactBtnBgColor.trim() || "#000000",
      headerContactBtnTextColor: headerContactBtnTextColor.trim() || "#ffffff",
      address: clinicAddress,
      phone: clinicPhone,
      latitude: parseFloat(String(latitude)) || 10.01586,
      longitude: parseFloat(String(longitude)) || 76.34186,
      logo: {
        ...brandConfig.logo,
        type: logoImageUrl ? "IMAGE" : "ICON",
        imageUrl: logoImageUrl,
        clinicDisplayName: clinicDisplayName.trim() || "PedioDent",
        altText: `${clinicDisplayName.trim() || "PedioDent"} Clinic Logo`,
      },
      hero: liveHeroConfig,
    });

    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4500);
    } else {
      setErrorMessage(
        "Failed to persist branding & hero settings. Please verify administrator rights."
      );
    }
  };

  // Reset to Factory Defaults
  const handleResetDefaults = async () => {
    if (
      !confirm(
        "Reset both Header Branding and Hero Section to factory reference defaults?"
      )
    ) {
      return;
    }
    setSaving(true);
    setClinicDisplayName("PedioDent");
    setHeaderBgColor("#f4f4f5");
    setHeaderTextColor("#18181b");
    setHeaderContactBtnBgColor("#000000");
    setHeaderContactBtnTextColor("#ffffff");
    setLogoImageUrl("");

    // Reset Hero states
    setHeroTopInfoEnabled(true);
    setHeroTopInfoWorkingHoursLabel("Working hours");
    setHeroTopInfoWorkingHoursValue("Mon - Sat 8:00-20:00");
    setHeroTopInfoLocationLabel("Location");
    setHeroTopInfoLocationValue("12 Shevchenko Street, Kyiv");
    setHeroTopInfoTextColor("#18181b");
    setHeroTopInfoLabelColor("#64748b");
    setHeroTopInfoMarginTop("0px");
    setHeroUpperText("DENTAL CARE");
    setHeroUpperTextColor("#000000");
    setHeroUpperTextLetterSpacing("0.14em");
    setHeroShowUpperText(true);
    setHeroImageUrl("/images/hero-doctor-dental-care.png");
    setHeroMobileImageUrl("/images/hero-doctor-mobile.png");
    setHeroMobileImageFit("cover");
    setHeroMobileImageHeight("440px");
    setHeroMobileImageWidth("100%");
    setHeroMobileImageFullWidth(true);
    setHeroMobileImageBottomFade(true);
    setHeroImageWidth("560px");
    setHeroImageHeight("560px");
    setHeroImageBorderRadius("0px");
    setHeroImageFit("cover");
    setHeroHeroMinHeight("620px");
    setHeroImageOverlayOpacity(0);
    setHeroImageBottomFade(true);
    setHeroBackgroundColor("#ffffff");
    setHeroShowAuraCircle(false);
    setHeroAuraCircleColor("#d1d5db");
    setHeroSubtitleText(
      "Discover advanced care, personalized treatments, and trusted experts in a gentle, modern environment"
    );
    setHeroSubtitleTextColor("#475569");
    setHeroSubtitleBoxMarginTop("0px");
    setHeroSubtitleBoxMarginBottom("0px");
    setHeroCtaButtonText("Book Your Appointment");
    setHeroCtaButtonUrl("/contact");
    setHeroCtaButtonBgColor("#050505");
    setHeroCtaButtonTextColor("#ffffff");
    setHeroCtaButtonBorderRadius("14px");
    setHeroCtaButtonShowIcon(true);
    setHeroCtaButtonStyle("badge-arrow");
    setHeroCtaButtonBadgeBgColor("#ffffff");
    setHeroCtaButtonBadgeIconColor("");
    setHeroDoctorBoxEnabled(true);
    setHeroDoctorBoxName("Dr. Alex Mercer");
    setHeroDoctorBoxRole("Senior Dental Specialist");
    setHeroDoctorBoxShowRole(true);
    setHeroDoctorBoxExperience("8+ Years of Experience (4.9 ★ Rating)");
    setHeroDoctorBoxShowExperience(true);
    setHeroDoctorBoxPhotoUrl("/images/hero-doctor-dental-care.png");
    setHeroDoctorBoxShowPhoto(true);
    setHeroDoctorBoxBgColor("rgba(148, 153, 162, 0.92)");
    setHeroDoctorBoxTextColor("#ffffff");
    setHeroDoctorBoxBorderRadius("20px");
    setHeroDoctorBoxMarginTop("0px");
    setHeroDoctorBoxMarginBottom("0px");

    await resetBrandConfig();

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-brand-text sm:text-3xl">
              Clinic Branding &amp; Hero Customizer
            </h1>
            <Badge variant="default" className="text-[11px] font-semibold">
              Live Interactive Studio
            </Badge>
          </div>
          <p className="mt-1 text-xs text-brand-muted sm:text-sm">
            Fully customize the public homepage Hero section, doctor cutout photo, dimensions, colors, buttons, and floating doctor card with real-time preview including the Header Navbar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            disabled={saving}
            className="h-9 gap-1.5 text-xs text-brand-muted hover:text-red-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="h-9 gap-1.5 text-xs font-semibold shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Saving Changes..." : "Save Branding & Hero"}</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Hero &amp; Clinic Branding Updated Live!</strong> Your new hero image, dimensions, button styles, upper text, doctor info card, and header are now active across the entire website.
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-800 dark:text-red-300">
          <Shield className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNIFIED LIVE PREVIEW: HEADER NAVBAR + HERO SECTION TOGETHER               */}
      {/* ========================================================================= */}
      <Card className="overflow-hidden border-2 border-brand-primary/50 shadow-md">
        <CardHeader className="border-b border-brand-border/70 bg-brand-surface/70 pb-3 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-primary" />
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider">
                  Live Preview: Header Navbar + Hero Page
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time preview matching the reference design layout across desktop, tablet, and mobile.
                </CardDescription>
              </div>
            </div>

            {/* Responsive Device Switcher Tabs */}
            <div className="flex items-center rounded-xl border border-brand-border bg-brand-background p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                  previewDevice === "desktop"
                    ? "bg-brand-primary text-brand-primary-foreground font-semibold shadow-xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Laptop / Desktop View (1440px)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice("tablet")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                  previewDevice === "tablet"
                    ? "bg-brand-primary text-brand-primary-foreground font-semibold shadow-xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Tablet className="h-3.5 w-3.5" />
                <span>Tablet View (768px - 1024px)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                  previewDevice === "mobile"
                    ? "bg-brand-primary text-brand-primary-foreground font-semibold shadow-xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile View (320px - 767px)</span>
              </button>
            </div>
          </div>
        </CardHeader>

        {/* Live Preview Canvas Container with Hero Image containing Navbar Background */}
        <CardContent className="bg-zinc-200/60 dark:bg-zinc-950/70 p-4 sm:p-8 flex justify-center">
          <div
            className={`relative w-full overflow-hidden rounded-2xl border border-zinc-300 shadow-xl transition-all duration-300 dark:border-zinc-800 ${
              previewDevice === "mobile"
                ? "max-w-[390px] border-4 border-zinc-700/80 rounded-[32px]"
                : previewDevice === "tablet"
                  ? "max-w-[780px]"
                  : "max-w-5xl"
            }`}
            style={{
              backgroundColor: heroBackgroundColor,
            }}
          >
            {/* 1. Simulated Floating Header Navbar inside preview (Sitting on top of Hero Image) */}
            <div className="relative z-30 w-full px-3 py-2.5 sm:px-6 sm:py-3.5 transition-all">
              <div
                className="mx-auto flex h-13 sm:h-14 items-center justify-between rounded-2xl border border-white/25 px-3 sm:px-5 shadow-xs backdrop-blur-md transition-all duration-200"
                style={{
                  backgroundColor: headerBgColor,
                }}
              >
                {/* Logo & Clinic Name */}
                <div className="flex items-center gap-2">
                  {logoImageUrl ? (
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-black/5 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoImageUrl}
                        alt={clinicDisplayName}
                        className="h-full w-full object-contain rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white shadow-xs">
                      <ToothVectorIcon className="h-4 w-4" />
                    </div>
                  )}
                  <span
                    className="font-heading text-sm sm:text-base font-bold tracking-tight truncate max-w-[130px] sm:max-w-[180px]"
                    style={{ color: headerTextColor }}
                  >
                    {clinicDisplayName || "PedioDent"}
                  </span>
                </div>

                {/* Nav Links (Hidden in mobile view) */}
                {previewDevice !== "mobile" && (
                  <div className="hidden sm:flex items-center gap-5">
                    {["Home", "Services", "About Us", "Blog"].map((item, idx) => (
                      <span
                        key={item}
                        className={`text-xs ${
                          idx === 0
                            ? "font-bold underline decoration-2 underline-offset-4"
                            : "font-medium opacity-85"
                        }`}
                        style={{ color: headerTextColor }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contact CTA Button */}
                <div className="flex items-center">
                  <div
                    className="inline-flex items-center justify-between gap-2 rounded-xl pl-3 pr-1 py-1 text-xs font-semibold shadow-xs select-none"
                    style={{
                      backgroundColor: headerContactBtnBgColor,
                      color: headerContactBtnTextColor,
                    }}
                  >
                    <span>Contact</span>
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white shadow-xs"
                      aria-hidden="true"
                    >
                      <ArrowRight
                        className="h-3 w-3 stroke-[2.2]"
                        style={{ color: headerContactBtnBgColor }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Live Hero Component inside preview */}
            <Hero customConfig={liveHeroConfig} previewMode={previewDevice} />
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* NAVIGATION TABS FOR CUSTOMIZATION PANELS                                  */}
      {/* ========================================================================= */}
      <div className="flex items-center border-b border-brand-border">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "hero"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Hero Page Customizer (Image, Dimensions, Button, Doctor Card)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("header")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "header"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>Header Navbar &amp; Logo Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "details"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Location &amp; Clinic Details</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HERO SECTION CUSTOMIZATION                                         */}
      {/* ========================================================================= */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          {/* 1. HERO BACKGROUND IMAGE & CANVAS SETTINGS */}
          <Card className="border border-brand-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      1. Hero Background Image &amp; Canvas Settings
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Customize desktop banner and dedicated mobile portrait image, fit mode, canvas height, dimming, and bottom fade
                    </CardDescription>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHeroImageUrl("/images/hero-doctor-dental-care.png");
                    setHeroMobileImageUrl("/images/hero-doctor-mobile.png");
                    setHeroImageFit("cover");
                    setHeroHeroMinHeight("620px");
                    setHeroImageOverlayOpacity(0);
                    setHeroImageBottomFade(true);
                    setHeroBackgroundColor("#ffffff");
                  }}
                  className="h-8 gap-1 text-xs"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Hero Canvas</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Dual Image Configuration: Desktop/Tablet Banner vs Mobile View Portrait */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* 1A. Desktop / Main Hero Image */}
                <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface/40 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Monitor className="h-4 w-4 text-brand-primary" />
                      <span className="text-xs font-bold text-brand-text">
                        Desktop &amp; Laptop Hero Image
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-brand-primary/5 text-brand-primary border-brand-primary/20"
                    >
                      Desktop View
                    </Badge>
                  </div>
                  <p className="text-[11px] text-brand-muted">
                    High-resolution banner spanning edge-to-edge behind the floating navbar on laptops and desktops.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text">
                      Image URL / Path
                    </label>
                    <Input
                      value={heroImageUrl}
                      onChange={(e) => setHeroImageUrl(e.target.value)}
                      placeholder="/images/hero-doctor-dental-care.png or https://..."
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div
                      onClick={() => heroImageInputRef.current?.click()}
                      className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-brand-border bg-brand-surface p-2.5 text-center transition-colors hover:border-brand-primary hover:bg-brand-primary/5"
                    >
                      <Upload className="h-3.5 w-3.5 text-brand-primary" />
                      <span className="text-xs font-medium text-brand-text">
                        Upload Desktop Image
                      </span>
                      <input
                        ref={heroImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleHeroImageUpload}
                        className="hidden"
                      />
                    </div>

                    {heroImageUrl && (
                      <div className="h-10 w-16 shrink-0 overflow-hidden rounded-md border border-brand-border bg-black/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroImageUrl}
                          alt="Desktop Hero Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 1B. Mobile View Dedicated Hero Image */}
                <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface/40 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-brand-text">
                        Mobile View Dedicated Hero Image
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    >
                      Mobile &lt; 768px
                    </Badge>
                  </div>
                  <p className="text-[11px] text-brand-muted">
                    Dedicated portrait image displayed in mobile view (phones &lt; 768px) and in Mobile Preview.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text">
                      Mobile Image URL / Path
                    </label>
                    <Input
                      value={heroMobileImageUrl}
                      onChange={(e) => setHeroMobileImageUrl(e.target.value)}
                      placeholder="/images/hero-doctor-mobile.png or https://..."
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div
                      onClick={() => mobileHeroImageInputRef.current?.click()}
                      className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-brand-border bg-brand-surface p-2.5 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-500/5"
                    >
                      <Upload className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-brand-text">
                        Upload Mobile Image
                      </span>
                      <input
                        ref={mobileHeroImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMobileHeroImageUpload}
                        className="hidden"
                      />
                    </div>

                    {heroMobileImageUrl && (
                      <div className="h-10 w-12 shrink-0 overflow-hidden rounded-md border border-brand-border bg-black/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroMobileImageUrl}
                          alt="Mobile Hero Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setHeroMobileImageUrl(
                          "/images/hero-doctor-mobile.png"
                        )
                      }
                      className="h-9 px-2 text-[11px] text-brand-muted hover:text-brand-text"
                      title="Reset to default mobile image"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Mobile Image Fit, Size & Bleed Customization */}
                  <div className="space-y-3 pt-3 border-t border-brand-border/60">
                    {/* Mobile Image Fit (Hero & Navbar) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-brand-text">
                          Image Fit (Hero &amp; Navbar)
                        </label>
                        <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                          {heroMobileImageFit}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setHeroMobileImageFit("cover")}
                          className={`rounded-lg py-1.5 px-2 text-xs font-semibold border transition-all ${
                            heroMobileImageFit === "cover"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                              : "border-brand-border text-brand-muted hover:text-brand-text"
                          }`}
                        >
                          Cover (Full Fill)
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroMobileImageFit("contain")}
                          className={`rounded-lg py-1.5 px-2 text-xs font-semibold border transition-all ${
                            heroMobileImageFit === "contain"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                              : "border-brand-border text-brand-muted hover:text-brand-text"
                          }`}
                        >
                          Contain (Aspect)
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroMobileImageFit("fill")}
                          className={`rounded-lg py-1.5 px-2 text-xs font-semibold border transition-all ${
                            heroMobileImageFit === "fill"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                              : "border-brand-border text-brand-muted hover:text-brand-text"
                          }`}
                        >
                          Fill (Stretch)
                        </button>
                      </div>
                      <span className="text-[10px] text-brand-muted block">
                        {heroMobileImageFit === "cover"
                          ? "Fills full mobile width & height seamlessly with clean cover crop"
                          : heroMobileImageFit === "fill"
                          ? "Stretches image to exact container boundaries"
                          : "Preserves full mobile image aspect ratio without cropping"}
                      </span>
                    </div>

                    {/* Mobile Image Height / Size */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-brand-text">
                          Mobile Image Height (Size)
                        </label>
                        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          {heroMobileImageHeight}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="280"
                        max="640"
                        step="20"
                        value={parseInt(heroMobileImageHeight, 10) || 440}
                        onChange={(e) =>
                          setHeroMobileImageHeight(`${e.target.value}px`)
                        }
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex flex-wrap gap-1">
                        {["320px", "380px", "440px", "500px", "580px", "auto"].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setHeroMobileImageHeight(sz)}
                            className={`rounded px-2 py-0.5 text-[10px] border ${
                              heroMobileImageHeight === sz
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                                : "border-brand-border text-brand-muted hover:text-brand-text"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Width / Full Bleed Mode */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xs font-semibold text-brand-text block">
                          Full-Bleed Edge-to-Edge Width
                        </span>
                        <span className="text-[10px] text-brand-muted block">
                          Spans 100% full width across the mobile screen
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={heroMobileImageFullWidth}
                        onChange={(e) => setHeroMobileImageFullWidth(e.target.checked)}
                        className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    {/* Mobile Bottom Fade */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xs font-semibold text-brand-text block">
                          Bottom Gradient Fade
                        </span>
                        <span className="text-[10px] text-brand-muted block">
                          Smoothly fade bottom of mobile image into background
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={heroMobileImageBottomFade}
                        onChange={(e) => setHeroMobileImageBottomFade(e.target.checked)}
                        className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Fit, Canvas Height, & Dark Dimming Overlay */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 border-t border-brand-border/60 pt-4">
                {/* Image Fit Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-brand-text">
                      Image Fit (Hero &amp; Navbar)
                    </label>
                    <span className="font-mono text-xs text-brand-primary font-bold uppercase">
                      {heroImageFit}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHeroImageFit("cover")}
                      className={`rounded-lg py-2 px-2 text-xs font-semibold border transition-all ${
                        heroImageFit === "cover"
                          ? "border-brand-primary bg-brand-primary/10 text-brand-primary shadow-xs"
                          : "border-brand-border text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      Cover (Full Fill)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroImageFit("contain")}
                      className={`rounded-lg py-2 px-2 text-xs font-semibold border transition-all ${
                        heroImageFit === "contain"
                          ? "border-brand-primary bg-brand-primary/10 text-brand-primary shadow-xs"
                          : "border-brand-border text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      Contain (Aspect)
                    </button>
                  </div>
                  <span className="text-[11px] text-brand-muted block">
                    {heroImageFit === "cover"
                      ? "Fills entire hero section & spans behind navbar"
                      : "Preserves full image proportions"}
                  </span>
                </div>

                {/* Hero Canvas Height */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-brand-text">
                      Canvas Total Height
                    </label>
                    <span className="font-mono text-xs text-brand-primary font-bold">
                      {heroHeroMinHeight}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="800"
                    step="20"
                    value={parseInt(heroHeroMinHeight, 10) || 620}
                    onChange={(e) =>
                      setHeroHeroMinHeight(`${e.target.value}px`)
                    }
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  <div className="flex gap-1.5">
                    {["540px", "620px", "700px", "780px"].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setHeroHeroMinHeight(sz)}
                        className={`rounded px-2 py-0.5 text-[11px] border ${
                          heroHeroMinHeight === sz
                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
                            : "border-brand-border text-brand-muted hover:text-brand-text"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Dimming / Overlay Opacity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-brand-text">
                      Overlay Contrast Dimming
                    </label>
                    <span className="font-mono text-xs text-brand-primary font-bold">
                      {Math.round(heroImageOverlayOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.6"
                    step="0.02"
                    value={heroImageOverlayOpacity}
                    onChange={(e) =>
                      setHeroImageOverlayOpacity(parseFloat(e.target.value))
                    }
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  <div className="flex gap-1.5">
                    {[
                      { label: "0%", val: 0 },
                      { label: "12%", val: 0.12 },
                      { label: "25%", val: 0.25 },
                      { label: "40%", val: 0.4 },
                    ].map((ov) => (
                      <button
                        key={ov.label}
                        type="button"
                        onClick={() => setHeroImageOverlayOpacity(ov.val)}
                        className={`rounded px-2 py-0.5 text-[11px] border ${
                          Math.abs(heroImageOverlayOpacity - ov.val) < 0.03
                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
                            : "border-brand-border text-brand-muted hover:text-brand-text"
                        }`}
                      >
                        {ov.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles: Bottom Gradient Fade, Canvas Background Color */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-brand-border/60 pt-4">
                {/* Bottom Fade Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface/40 p-3">
                  <div>
                    <span className="text-xs font-semibold text-brand-text block">
                      Bottom Gradient Fade
                    </span>
                    <span className="text-[11px] text-brand-muted block">
                      Blends lower edge smoothly into background
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={heroImageBottomFade}
                    onChange={(e) => setHeroImageBottomFade(e.target.checked)}
                    className="h-4 w-4 accent-brand-primary cursor-pointer"
                  />
                </div>

                {/* Hero Canvas Background Color */}
                <div className="space-y-1.5 rounded-xl border border-brand-border bg-brand-surface/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-text">
                      Canvas Background Color
                    </span>
                    <span className="font-mono text-[11px] text-brand-muted uppercase">
                      {heroBackgroundColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        heroBackgroundColor.startsWith("#")
                          ? heroBackgroundColor
                          : "#ffffff"
                      }
                      onChange={(e) => setHeroBackgroundColor(e.target.value)}
                      className="h-7 w-9 cursor-pointer rounded border border-brand-border bg-transparent p-0.5"
                    />
                    <Input
                      value={heroBackgroundColor}
                      onChange={(e) => setHeroBackgroundColor(e.target.value)}
                      placeholder="#ffffff"
                      className="h-7 font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. SUBTITLE & APPOINTMENT BUTTON (ON IMAGE) */}
          <Card className="border border-brand-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <MousePointerClick className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    2. Subtitle &amp; Appointment Button (Bottom-Left On Image)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Customize the intro text, button text, background color, text color, shape, and placement on the image
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Subtitle Description */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Subtitle Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={heroSubtitleText}
                    onChange={(e) => setHeroSubtitleText(e.target.value)}
                    placeholder="Discover advanced care, personalized treatments..."
                    className="w-full rounded-lg border border-brand-border bg-brand-surface p-2.5 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Subtitle Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={heroSubtitleTextColor.startsWith("#") ? heroSubtitleTextColor : "#475569"}
                      onChange={(e) => setHeroSubtitleTextColor(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-brand-border bg-transparent p-0.5"
                    />
                    <Input
                      value={heroSubtitleTextColor}
                      onChange={(e) => setHeroSubtitleTextColor(e.target.value)}
                      className="h-9 font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Appointment CTA Button Options */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-brand-border/60 pt-4">
                {/* Button Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Appointment Button Text
                  </label>
                  <Input
                    value={heroCtaButtonText}
                    onChange={(e) => setHeroCtaButtonText(e.target.value)}
                    placeholder="Book Your Appointment"
                    className="text-xs font-semibold"
                  />
                </div>

                {/* Button Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Button Destination URL
                  </label>
                  <Input
                    value={heroCtaButtonUrl}
                    onChange={(e) => setHeroCtaButtonUrl(e.target.value)}
                    placeholder="/contact"
                    className="font-mono text-xs"
                  />
                </div>

                {/* Button Background Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Button Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={heroCtaButtonBgColor.startsWith("#") ? heroCtaButtonBgColor : "#050505"}
                      onChange={(e) => setHeroCtaButtonBgColor(e.target.value)}
                      className="h-9 w-11 cursor-pointer rounded border border-brand-border bg-transparent p-0.5"
                    />
                    <Input
                      value={heroCtaButtonBgColor}
                      onChange={(e) => setHeroCtaButtonBgColor(e.target.value)}
                      className="h-9 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Button Text Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Button Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={heroCtaButtonTextColor.startsWith("#") ? heroCtaButtonTextColor : "#ffffff"}
                      onChange={(e) => setHeroCtaButtonTextColor(e.target.value)}
                      className="h-9 w-11 cursor-pointer rounded border border-brand-border bg-transparent p-0.5"
                    />
                    <Input
                      value={heroCtaButtonTextColor}
                      onChange={(e) => setHeroCtaButtonTextColor(e.target.value)}
                      className="h-9 font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Button Style: Badge Arrow Box vs Classic */}
              <div className="border-t border-brand-border/60 pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-semibold text-brand-text block">
                      Button Design & Style
                    </label>
                    <p className="text-[11px] text-brand-muted">
                      Choose between the modern inset badge arrow box style or classic inline icon
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHeroCtaButtonStyle("badge-arrow")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                        heroCtaButtonStyle === "badge-arrow"
                          ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-xs"
                          : "border-brand-border text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-white text-zinc-900 shadow-2xs">
                        <ArrowRight className="h-2.5 w-2.5 stroke-[2.5]" />
                      </span>
                      <span>Badge Box (Modern)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroCtaButtonStyle("classic")}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                        heroCtaButtonStyle === "classic"
                          ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-xs"
                          : "border-brand-border text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span>Classic (↗)</span>
                    </button>
                  </div>
                </div>

                {/* Badge Color Options when badge-arrow is selected */}
                {heroCtaButtonStyle === "badge-arrow" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-brand-border/70 bg-black/5 dark:bg-white/5 p-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-text">
                        Badge Box Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={heroCtaButtonBadgeBgColor.startsWith("#") ? heroCtaButtonBadgeBgColor : "#ffffff"}
                          onChange={(e) => setHeroCtaButtonBadgeBgColor(e.target.value)}
                          className="h-8 w-10 cursor-pointer rounded border border-brand-border bg-transparent p-0.5"
                        />
                        <Input
                          value={heroCtaButtonBadgeBgColor}
                          onChange={(e) => setHeroCtaButtonBadgeBgColor(e.target.value)}
                          className="h-8 font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-text">
                        Badge Arrow Color (Optional, defaults to button color)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            heroCtaButtonBadgeIconColor && heroCtaButtonBadgeIconColor.startsWith("#")
                              ? heroCtaButtonBadgeIconColor
                              : (heroCtaButtonBgColor.startsWith("#") ? heroCtaButtonBgColor : "#881318")
                          }
                          onChange={(e) => setHeroCtaButtonBadgeIconColor(e.target.value)}
                          className="h-8 w-10 cursor-pointer rounded border border-brand-border bg-transparent p-0.5"
                        />
                        <Input
                          value={heroCtaButtonBadgeIconColor}
                          placeholder={heroCtaButtonBgColor}
                          onChange={(e) => setHeroCtaButtonBadgeIconColor(e.target.value)}
                          className="h-8 font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Button Shape & Presets */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-border/60 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-brand-text">Button Shape:</span>
                  {[
                    { label: "Rounded (14px)", val: "14px" },
                    { label: "Rounded (16px)", val: "16px" },
                    { label: "Pill (Full Round)", val: "9999px" },
                    { label: "Subtle (8px)", val: "8px" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setHeroCtaButtonBorderRadius(s.val)}
                      className={`rounded-lg px-2.5 py-1 text-xs border ${
                        heroCtaButtonBorderRadius === s.val
                          ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
                          : "border-brand-border text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Show Icon Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showArrowIcon"
                    checked={heroCtaButtonShowIcon}
                    onChange={(e) => setHeroCtaButtonShowIcon(e.target.checked)}
                    className="h-4 w-4 accent-brand-primary cursor-pointer"
                  />
                  <label htmlFor="showArrowIcon" className="text-xs text-brand-text cursor-pointer">
                    Show Arrow Icon in Button
                  </label>
                </div>
              </div>

              {/* Top & Bottom Margin (Vertical Placement) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-brand-border/60 pt-4">
                {/* Top Margin */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-brand-text">
                      Top Margin (Push Down)
                    </label>
                    <span className="font-mono text-xs text-brand-primary font-bold">
                      {heroSubtitleBoxMarginTop}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="4"
                    value={parseInt(heroSubtitleBoxMarginTop, 10) || 0}
                    onChange={(e) => setHeroSubtitleBoxMarginTop(`${e.target.value}px`)}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {["0px", "16px", "32px", "48px", "64px", "96px"].map((mg) => (
                      <button
                        key={mg}
                        type="button"
                        onClick={() => setHeroSubtitleBoxMarginTop(mg)}
                        className={`rounded px-2 py-0.5 text-[11px] border ${
                          heroSubtitleBoxMarginTop === mg
                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
                            : "border-brand-border text-brand-muted hover:text-brand-text"
                        }`}
                      >
                        {mg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Margin */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-brand-text">
                      Bottom Margin (Lift Up)
                    </label>
                    <span className="font-mono text-xs text-brand-primary font-bold">
                      {heroSubtitleBoxMarginBottom}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="4"
                    value={parseInt(heroSubtitleBoxMarginBottom, 10) || 0}
                    onChange={(e) => setHeroSubtitleBoxMarginBottom(`${e.target.value}px`)}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {["0px", "16px", "32px", "48px", "64px", "96px"].map((mg) => (
                      <button
                        key={mg}
                        type="button"
                        onClick={() => setHeroSubtitleBoxMarginBottom(mg)}
                        className={`rounded px-2 py-0.5 text-[11px] border ${
                          heroSubtitleBoxMarginBottom === mg
                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
                            : "border-brand-border text-brand-muted hover:text-brand-text"
                        }`}
                      >
                        {mg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. DOCTOR INFORMATION CARD (BOTTOM-RIGHT FLOATING BOX ON IMAGE) */}
          <Card className="border border-brand-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      3. Doctor Information Card (Bottom-Right Floating Box On Image)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Change doctor name, specialization, experience, rating, or remove/hide specific lines or the entire box placed on the image
                    </CardDescription>
                  </div>
                </div>

                {/* Master Card Toggle */}
                <div className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface/60 px-3 py-1.5">
                  <label htmlFor="toggleDocCard" className="text-xs font-semibold text-brand-text cursor-pointer">
                    Show Doctor Card
                  </label>
                  <input
                    id="toggleDocCard"
                    type="checkbox"
                    checked={heroDoctorBoxEnabled}
                    onChange={(e) => setHeroDoctorBoxEnabled(e.target.checked)}
                    className="h-4 w-4 accent-brand-primary cursor-pointer"
                  />
                </div>
              </div>
            </CardHeader>

            {heroDoctorBoxEnabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Doctor Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text">
                      Doctor Full Name
                    </label>
                    <Input
                      value={heroDoctorBoxName}
                      onChange={(e) => setHeroDoctorBoxName(e.target.value)}
                      placeholder="Dr. Alex Mercer"
                      className="text-xs font-semibold"
                    />
                  </div>

                  {/* Doctor Specialization / Role */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-brand-text">
                        Specialization / Title
                      </label>
                      <label className="flex items-center gap-1 text-[11px] text-brand-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={heroDoctorBoxShowRole}
                          onChange={(e) => setHeroDoctorBoxShowRole(e.target.checked)}
                          className="h-3.5 w-3.5 accent-brand-primary"
                        />
                        <span>Show</span>
                      </label>
                    </div>
                    <Input
                      value={heroDoctorBoxRole}
                      onChange={(e) => setHeroDoctorBoxRole(e.target.value)}
                      placeholder="Senior Dental Specialist"
                      className="text-xs"
                      disabled={!heroDoctorBoxShowRole}
                    />
                  </div>

                  {/* Experience & Rating */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-brand-text">
                        Experience &amp; Rating
                      </label>
                      <label className="flex items-center gap-1 text-[11px] text-brand-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={heroDoctorBoxShowExperience}
                          onChange={(e) => setHeroDoctorBoxShowExperience(e.target.checked)}
                          className="h-3.5 w-3.5 accent-brand-primary"
                        />
                        <span>Show</span>
                      </label>
                    </div>
                    <Input
                      value={heroDoctorBoxExperience}
                      onChange={(e) => setHeroDoctorBoxExperience(e.target.value)}
                      placeholder="8+ Years of Experience (4.9 ★ Rating)"
                      className="text-xs"
                      disabled={!heroDoctorBoxShowExperience}
                    />
                  </div>
                </div>

                {/* Avatar Photo & Toggles */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-brand-border/60 pt-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-brand-text">
                        Doctor Avatar Thumbnail URL
                      </label>
                      <label className="flex items-center gap-1 text-[11px] text-brand-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={heroDoctorBoxShowPhoto}
                          onChange={(e) => setHeroDoctorBoxShowPhoto(e.target.checked)}
                          className="h-3.5 w-3.5 accent-brand-primary"
                        />
                        <span>Show Avatar</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={heroDoctorBoxPhotoUrl}
                        onChange={(e) => setHeroDoctorBoxPhotoUrl(e.target.value)}
                        placeholder="/images/hero-doctor-dental-care.png"
                        className="font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => doctorAvatarInputRef.current?.click()}
                        className="h-9 shrink-0 gap-1 text-xs"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload</span>
                      </Button>
                      <input
                        ref={doctorAvatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleDoctorAvatarUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Card Background Color */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text">
                      Card Glassmorphism Color
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={heroDoctorBoxBgColor}
                        onChange={(e) => setHeroDoctorBoxBgColor(e.target.value)}
                        placeholder="rgba(148, 153, 162, 0.92)"
                        className="h-9 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Top & Bottom Margin (Vertical Placement) for Doctor Card */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-brand-border/60 pt-4">
                  {/* Top Margin */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-brand-text">
                        Doctor Card Top Margin (Push Down)
                      </label>
                      <span className="font-mono text-xs text-brand-primary font-bold">
                        {heroDoctorBoxMarginTop}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="4"
                      value={parseInt(heroDoctorBoxMarginTop, 10) || 0}
                      onChange={(e) => setHeroDoctorBoxMarginTop(`${e.target.value}px`)}
                      className="w-full accent-brand-primary cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {["0px", "16px", "32px", "48px", "64px", "96px"].map((mg) => (
                        <button
                          key={mg}
                          type="button"
                          onClick={() => setHeroDoctorBoxMarginTop(mg)}
                          className={`rounded px-2 py-0.5 text-[11px] border ${
                            heroDoctorBoxMarginTop === mg
                              ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
                              : "border-brand-border text-brand-muted hover:text-brand-text"
                          }`}
                        >
                          {mg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Margin */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-brand-text">
                        Doctor Card Bottom Margin (Lift Up)
                      </label>
                      <span className="font-mono text-xs text-brand-primary font-bold">
                        {heroDoctorBoxMarginBottom}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="4"
                      value={parseInt(heroDoctorBoxMarginBottom, 10) || 0}
                      onChange={(e) => setHeroDoctorBoxMarginBottom(`${e.target.value}px`)}
                      className="w-full accent-brand-primary cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {["0px", "16px", "32px", "48px", "64px", "96px"].map((mg) => (
                        <button
                          key={mg}
                          type="button"
                          onClick={() => setHeroDoctorBoxMarginBottom(mg)}
                          className={`rounded px-2 py-0.5 text-[11px] border ${
                            heroDoctorBoxMarginBottom === mg
                              ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
                              : "border-brand-border text-brand-muted hover:text-brand-text"
                          }`}
                        >
                          {mg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 4. TOP INFORMATION BAR (WORKING HOURS ON LEFT & LOCATION ON RIGHT) */}
          <Card className="border border-brand-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      4. Top Information Bar (Top of Hero Image)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Displays Working Hours on the left side and Location address on the right side on top of the hero image
                    </CardDescription>
                  </div>
                </div>

                {/* Master Toggle */}
                <div className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface/60 px-3 py-1.5">
                  <label htmlFor="toggleTopInfo" className="text-xs font-semibold text-brand-text cursor-pointer">
                    Show Top Info
                  </label>
                  <input
                    id="toggleTopInfo"
                    type="checkbox"
                    checked={heroTopInfoEnabled}
                    onChange={(e) => setHeroTopInfoEnabled(e.target.checked)}
                    className="h-4 w-4 rounded accent-brand-primary cursor-pointer"
                  />
                </div>
              </div>
            </CardHeader>

            {heroTopInfoEnabled && (
              <CardContent className="space-y-6">
                {/* Working Hours (Left) & Location (Right) Inputs */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Left: Working Hours */}
                  <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface/40 p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-brand-primary" />
                      <span className="text-xs font-bold text-brand-text">
                        Left Side: Working Hours
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-text">
                        Label Title
                      </label>
                      <Input
                        value={heroTopInfoWorkingHoursLabel}
                        onChange={(e) => setHeroTopInfoWorkingHoursLabel(e.target.value)}
                        placeholder="Working hours"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-text">
                        Working Hours Schedule
                      </label>
                      <Input
                        value={heroTopInfoWorkingHoursValue}
                        onChange={(e) => setHeroTopInfoWorkingHoursValue(e.target.value)}
                        placeholder="Mon - Sat 8:00-20:00"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Right: Location */}
                  <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface/40 p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-primary" />
                      <span className="text-xs font-bold text-brand-text">
                        Right Side: Location
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-text">
                        Label Title
                      </label>
                      <Input
                        value={heroTopInfoLocationLabel}
                        onChange={(e) => setHeroTopInfoLocationLabel(e.target.value)}
                        placeholder="Location"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-text">
                        Location / Address
                      </label>
                      <Input
                        value={heroTopInfoLocationValue}
                        onChange={(e) => setHeroTopInfoLocationValue(e.target.value)}
                        placeholder="12 Shevchenko Street, Kyiv"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Color and Styling Customization */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {/* Values Text Color */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-brand-text">
                      Values Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={heroTopInfoTextColor.startsWith("#") ? heroTopInfoTextColor : "#18181b"}
                        onChange={(e) => setHeroTopInfoTextColor(e.target.value)}
                        className="h-8 w-10 cursor-pointer rounded border border-brand-border bg-transparent p-0.5"
                      />
                      <Input
                        value={heroTopInfoTextColor}
                        onChange={(e) => setHeroTopInfoTextColor(e.target.value)}
                        placeholder="#18181b or #ffffff"
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      {["#18181b", "#ffffff", "#0f172a", "#9e0000"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setHeroTopInfoTextColor(c)}
                          className="h-5 w-5 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Labels Color */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-brand-text">
                      Labels Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={heroTopInfoLabelColor.startsWith("#") ? heroTopInfoLabelColor : "#64748b"}
                        onChange={(e) => setHeroTopInfoLabelColor(e.target.value)}
                        className="h-8 w-10 cursor-pointer rounded border border-brand-border bg-transparent p-0.5"
                      />
                      <Input
                        value={heroTopInfoLabelColor}
                        onChange={(e) => setHeroTopInfoLabelColor(e.target.value)}
                        placeholder="#64748b or rgba(255,255,255,0.7)"
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      {["#64748b", "rgba(255, 255, 255, 0.75)", "#94a3b8", "#334155"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setHeroTopInfoLabelColor(c)}
                          className="h-5 w-5 rounded-full border border-black/20 shadow-xs text-[9px] flex items-center justify-center font-bold"
                          style={{ backgroundColor: c.startsWith("rgba") ? "#94a3b8" : c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Top Margin / Offset */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-brand-text">
                      Top Spacing Offset
                    </label>
                    <Input
                      value={heroTopInfoMarginTop}
                      onChange={(e) => setHeroTopInfoMarginTop(e.target.value)}
                      placeholder="0px or 8px or 16px"
                      className="font-mono text-xs"
                    />
                    <div className="flex gap-1.5">
                      {["0px", "4px", "8px", "16px"].map((sp) => (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => setHeroTopInfoMarginTop(sp)}
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                            heroTopInfoMarginTop === sp
                              ? "bg-brand-primary text-white"
                              : "border border-brand-border text-brand-muted hover:text-brand-text"
                          }`}
                        >
                          {sp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HEADER NAVBAR & LOGO SETTINGS                                      */}
      {/* ========================================================================= */}
      {activeTab === "header" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 1. CLINIC BRAND DISPLAY NAME */}
          <Card className="border border-brand-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <Type className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">1. Clinic Display Name</CardTitle>
                  <CardDescription className="text-xs">
                    Name shown beside the logo in the header navbar
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Clinic Display Name
                </label>
                <Input
                  value={clinicDisplayName}
                  onChange={(e) => setClinicDisplayName(e.target.value)}
                  placeholder="e.g. PedioDent"
                  className="text-sm font-medium"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-brand-muted">Quick suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["PedioDent", "CA Smile Dental Clinic", "Smile Care Center"].map(
                    (name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setClinicDisplayName(name)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                          clinicDisplayName === name
                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold"
                            : "border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
                        }`}
                      >
                        {name}
                      </button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. HEADER BACKGROUND COLOR */}
          <Card className="border border-brand-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">2. Header Background Color</CardTitle>
                  <CardDescription className="text-xs">
                    Background tint of the floating header pill
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={headerBgColor.startsWith("#") ? headerBgColor : "#f4f4f5"}
                  onChange={(e) => setHeaderBgColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-brand-border bg-transparent p-1"
                />
                <Input
                  value={headerBgColor}
                  onChange={(e) => setHeaderBgColor(e.target.value)}
                  placeholder="#f4f4f5"
                  className="font-mono text-xs uppercase"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-brand-muted">Color presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {BG_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setHeaderBgColor(preset.value)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                        headerBgColor.toLowerCase() === preset.value.toLowerCase()
                          ? "border-brand-primary bg-brand-primary/10 font-bold text-brand-primary"
                          : "border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.value }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. HEADER TEXT COLOR */}
          <Card className="border border-brand-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">3. Header Text Color</CardTitle>
                  <CardDescription className="text-xs">
                    Color of brand text, navigation links, and icons
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={headerTextColor.startsWith("#") ? headerTextColor : "#18181b"}
                  onChange={(e) => setHeaderTextColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-brand-border bg-transparent p-1"
                />
                <Input
                  value={headerTextColor}
                  onChange={(e) => setHeaderTextColor(e.target.value)}
                  placeholder="#18181b"
                  className="font-mono text-xs uppercase"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-brand-muted">Color presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {TEXT_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setHeaderTextColor(preset.value)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                        headerTextColor.toLowerCase() === preset.value.toLowerCase()
                          ? "border-brand-primary bg-brand-primary/10 font-bold text-brand-primary"
                          : "border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.value }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. HEADER CONTACT BUTTON */}
          <Card className="border border-brand-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <MousePointerClick className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">4. Header Contact Button</CardTitle>
                  <CardDescription className="text-xs">
                    Button background &amp; text color in the header pill
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-text">
                  Button Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={headerContactBtnBgColor.startsWith("#") ? headerContactBtnBgColor : "#000000"}
                    onChange={(e) => setHeaderContactBtnBgColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-brand-border bg-transparent p-1"
                  />
                  <Input
                    value={headerContactBtnBgColor}
                    onChange={(e) => setHeaderContactBtnBgColor(e.target.value)}
                    placeholder="#000000"
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-brand-border/60 pt-3">
                <label className="text-xs font-semibold text-brand-text">
                  Button Text Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={headerContactBtnTextColor.startsWith("#") ? headerContactBtnTextColor : "#ffffff"}
                    onChange={(e) => setHeaderContactBtnTextColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-brand-border bg-transparent p-1"
                  />
                  <Input
                    value={headerContactBtnTextColor}
                    onChange={(e) => setHeaderContactBtnTextColor(e.target.value)}
                    placeholder="#ffffff"
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. CLINIC LOGO */}
          <Card className="border border-brand-border shadow-xs md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">5. Clinic Logo</CardTitle>
                  <CardDescription className="text-xs">
                    Upload a custom clinic logo image or use the default emblem
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface p-3">
                <div className="flex items-center gap-3">
                  {logoImageUrl ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border bg-black/5 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoImageUrl}
                        alt="Active Logo"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                      <ToothVectorIcon className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-brand-text">
                      {logoImageUrl ? "Custom Image Logo Active" : "Default Tooth Vector Emblem"}
                    </div>
                    <div className="text-[11px] text-brand-muted">
                      {logoImageUrl ? "Displays uploaded image" : "Clean vector dental logo"}
                    </div>
                  </div>
                </div>

                {logoImageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLogoImageUrl("")}
                    className="h-8 gap-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove Image</span>
                  </Button>
                )}
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-border/80 bg-brand-background/50 p-4 text-center transition-colors hover:border-brand-primary/60 hover:bg-brand-primary/5"
              >
                <Upload className="h-5 w-5 text-brand-primary mb-1" />
                <span className="text-xs font-semibold text-brand-text">Click to upload logo image</span>
                <span className="text-[10px] text-brand-muted">PNG, SVG, JPG, WebP (Max 2MB)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LOCATION & CLINIC DETAILS (OPTIONAL)                               */}
      {/* ========================================================================= */}
      {activeTab === "details" && (
        <Card className="border border-brand-border shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">Clinic Location &amp; Contact Details</CardTitle>
                <CardDescription className="text-xs">
                  Physical address, coordinates for interactive map, and reception phone number
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-brand-muted">Clinic Address</label>
              <Input
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                className="text-xs"
                placeholder="Clinic street address"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-brand-muted">Clinic Phone</label>
              <Input
                value={clinicPhone}
                onChange={(e) => setClinicPhone(e.target.value)}
                className="text-xs"
                placeholder="+91 98470 12345"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-brand-muted">Map Latitude</label>
              <Input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-brand-muted">Map Longitude</label>
              <Input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Action Sticky Footer */}
      <div className="sticky bottom-4 z-30 flex items-center justify-between rounded-2xl border border-brand-border bg-brand-surface/95 backdrop-blur-md p-4 shadow-lg">
        <div className="text-xs text-brand-muted">
          Click <strong>Save Branding &amp; Hero</strong> to apply your customizations to the public website immediately.
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => handleSaveAll()}
          disabled={saving}
          className="gap-2 font-semibold shadow-sm"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Changes..." : "Save Branding & Hero"}</span>
        </Button>
      </div>
    </div>
  );
}
