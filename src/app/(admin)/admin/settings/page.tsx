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
  Check,
  Layout,
  Columns,
  Video,
  Loader2,
  BookOpen,
} from "lucide-react";
import { ClinicBrandingBlogManager } from "@/components/admin/blog/clinic-branding-blog-manager";
import { ClinicBrandingGalleryManager } from "@/components/admin/gallery/clinic-branding-gallery-manager";
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
import { AboutVideoPlayer } from "@/components/public/about-video-player";
import {
  DEFAULT_HERO_CONFIG,
  HeroSectionConfig,
  HeroVariant,
  DEFAULT_ABOUT_CONFIG,
  AboutSectionConfig,
  DEFAULT_GALLERY_CONFIG,
} from "@/types/branding";

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
  const [activeTab, setActiveTab] = useState<"hero" | "header" | "about" | "details" | "blog" | "gallery">("hero");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["hero", "header", "about", "details", "blog", "gallery"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  // Preview Viewport Mode State
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // =========================================================================
  // 1. HEADER BRANDING STATE
  // =========================================================================
  const [clinicDisplayName, setClinicDisplayName] = useState(
    brandConfig.logo?.clinicDisplayName || brandConfig.clinicName || "PedioDent"
  );
  const [showClinicName, setShowClinicName] = useState<boolean>(
    brandConfig.logo?.showClinicName !== false
  );
  const [logoHeight, setLogoHeight] = useState<number>(
    brandConfig.logo?.logoHeight || brandConfig.logo?.logoSize || 36
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
  // 1-B. ABOUT US & VIDEO PLAYER SETTINGS STATE
  // =========================================================================
  const initialAbout = brandConfig.aboutSection || DEFAULT_ABOUT_CONFIG;
  const [aboutVideoUrl, setAboutVideoUrl] = useState(
    initialAbout.videoUrl || brandConfig.aboutVideoUrl || "https://www.youtube.com/watch?v=mbBugyspbPE"
  );
  const [aboutVideoTitle, setAboutVideoTitle] = useState(
    initialAbout.videoTitle || "Take a Look Inside Our Clinic"
  );
  const [aboutVideoSubtitle, setAboutVideoSubtitle] = useState(
    initialAbout.videoSubtitle || "Clinic Tour & Experience"
  );
  const [aboutBadgeText, setAboutBadgeText] = useState(
    initialAbout.badgeText || "Autoplays on scroll • Interactive play & pause"
  );
  const [aboutAutoplayOnScroll, setAboutAutoplayOnScroll] = useState(
    initialAbout.autoplayOnScroll !== false
  );
  const [aboutVideoSize, setAboutVideoSize] = useState<"max-w-4xl" | "max-w-5xl" | "max-w-6xl" | "max-w-full">(
    initialAbout.videoSize || "max-w-4xl"
  );
  const [aboutDefaultQuality, setAboutDefaultQuality] = useState<"hd1080" | "hd720" | "medium" | "auto">(
    initialAbout.defaultQuality || "hd1080"
  );
  const [aboutHideYouTubeBranding, setAboutHideYouTubeBranding] = useState(
    initialAbout.hideYouTubeBranding !== false
  );
  const [aboutStartMuted, setAboutStartMuted] = useState(
    initialAbout.startMuted !== false
  );
  const [aboutShowStatusPill, setAboutShowStatusPill] = useState(
    initialAbout.showStatusPill !== false
  );

  // =========================================================================
  // 2. HERO SECTION STATE
  // =========================================================================
  const initialHero = brandConfig.hero || DEFAULT_HERO_CONFIG;

  // Active Hero Template / Style: "default" | "blank1" | "blank2"
  const [heroVariant, setHeroVariant] = useState<HeroVariant>(
    initialHero.heroVariant || "default"
  );
  const [blankHeroTitle, setBlankHeroTitle] = useState(
    initialHero.blankHeroTitle || ""
  );
  const [blankHeroSubtitle, setBlankHeroSubtitle] = useState(
    initialHero.blankHeroSubtitle || ""
  );
  const [blankHeroCtaText, setBlankHeroCtaText] = useState(
    initialHero.blankHeroCtaText || ""
  );
  const [blankHeroCtaUrl, setBlankHeroCtaUrl] = useState(
    initialHero.blankHeroCtaUrl || "/contact"
  );
  const [blankHeroMinHeight, setBlankHeroMinHeight] = useState(
    initialHero.blankHeroMinHeight || "520px"
  );
  const [blankHeroBgColor, setBlankHeroBgColor] = useState(
    initialHero.blankHeroBgColor || "#ffffff"
  );
  const [blankHeroTextColor, setBlankHeroTextColor] = useState(
    initialHero.blankHeroTextColor || "#18181b"
  );

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

  // Clinic Location & Map Customization Fields
  const [clinicAddress, setClinicAddress] = useState(brandConfig.address || "");
  const [clinicPhone, setClinicPhone] = useState(brandConfig.phone || "");
  const [clinicEmail, setClinicEmail] = useState(brandConfig.email || "");
  const [latitude, setLatitude] = useState(brandConfig.latitude ?? 20.7636);
  const [longitude, setLongitude] = useState(brandConfig.longitude ?? 72.9680);

  // Map Section Appearance & Links
  const [mapSectionBgColor, setMapSectionBgColor] = useState(
    brandConfig.mapSectionBgColor || "#ffffff"
  );
  const [mapStyle, setMapStyle] = useState<"dark" | "light">(
    brandConfig.mapStyle || "dark"
  );
  const [whatsappPhone, setWhatsappPhone] = useState(
    brandConfig.whatsappPhone || brandConfig.phone || "+91 72260 98074"
  );
  const [instagramUrl, setInstagramUrl] = useState(
    brandConfig.instagramUrl || "https://instagram.com"
  );
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    brandConfig.googleMapsUrl ||
      "https://www.google.com/maps/place/CA+Smile+Multispeciality+Dental+Clinic/data=!4m2!3m1!1s0x0:0x3a288255f324c8de?sa=X&ved=1t:2428&ictx=111"
  );
  const [mapExactAddress, setMapExactAddress] = useState(
    brandConfig.mapExactAddress ||
      "1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank/ Krishna Dairy, Kutchhi Friends Society, Bilimora, Gujarat 396321"
  );
  const [mapSectionTitle, setMapSectionTitle] = useState(
    brandConfig.mapSectionTitle || "ADDRESS"
  );
  const [mapCardTitle, setMapCardTitle] = useState(
    brandConfig.mapCardTitle || brandConfig.clinicName || "CA Smile Dental Clinic"
  );
  const [mapCardImage, setMapCardImage] = useState(
    brandConfig.mapCardImage || "/images/ca-smile-clinic-building.jpg"
  );
  const [mapPinPulse, setMapPinPulse] = useState(
    brandConfig.mapPinPulse !== false
  );
  const [mapPinColor, setMapPinColor] = useState(
    brandConfig.mapPinColor || "#E53935"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const mobileHeroImageInputRef = useRef<HTMLInputElement>(null);
  const doctorAvatarInputRef = useRef<HTMLInputElement>(null);
  const mapCardImageInputRef = useRef<HTMLInputElement>(null);

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
      setShowClinicName(brandConfig.logo?.showClinicName !== false);
      setLogoHeight(brandConfig.logo?.logoHeight || brandConfig.logo?.logoSize || 36);
      setLogoImageUrl(brandConfig.logo?.imageUrl || "");
      setClinicAddress(brandConfig.address || "");
      setClinicPhone(brandConfig.phone || "");
      setClinicEmail(brandConfig.email || "");
      setLatitude(brandConfig.latitude ?? 20.7636);
      setLongitude(brandConfig.longitude ?? 72.9680);
      setMapSectionBgColor(brandConfig.mapSectionBgColor || "#ffffff");
      setMapStyle(brandConfig.mapStyle || "dark");
      setWhatsappPhone(
        brandConfig.whatsappPhone || brandConfig.phone || "+91 72260 98074"
      );
      setInstagramUrl(brandConfig.instagramUrl || "https://instagram.com");
      setAboutVideoUrl(
        brandConfig.aboutSection?.videoUrl || brandConfig.aboutVideoUrl || "https://www.youtube.com/watch?v=mbBugyspbPE"
      );
      setAboutVideoTitle(brandConfig.aboutSection?.videoTitle || "Take a Look Inside Our Clinic");
      setAboutVideoSubtitle(brandConfig.aboutSection?.videoSubtitle || "Clinic Tour & Experience");
      setAboutBadgeText(brandConfig.aboutSection?.badgeText || "Autoplays on scroll • Interactive play & pause");
      setAboutAutoplayOnScroll(brandConfig.aboutSection?.autoplayOnScroll !== false);
      setAboutVideoSize(brandConfig.aboutSection?.videoSize || "max-w-4xl");
      setAboutDefaultQuality(brandConfig.aboutSection?.defaultQuality || "hd1080");
      setAboutHideYouTubeBranding(brandConfig.aboutSection?.hideYouTubeBranding !== false);
      setAboutStartMuted(brandConfig.aboutSection?.startMuted !== false);
      setAboutShowStatusPill(brandConfig.aboutSection?.showStatusPill !== false);
      setGoogleMapsUrl(
        brandConfig.googleMapsUrl ||
          "https://www.google.com/maps/place/CA+Smile+Multispeciality+Dental+Clinic/data=!4m2!3m1!1s0x0:0x3a288255f324c8de?sa=X&ved=1t:2428&ictx=111"
      );
      setMapExactAddress(
        brandConfig.mapExactAddress ||
          "1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank/ Krishna Dairy, Kutchhi Friends Society, Bilimora, Gujarat 396321"
      );
      setMapSectionTitle(brandConfig.mapSectionTitle || "ADDRESS");
      setMapCardTitle(
        brandConfig.mapCardTitle ||
          brandConfig.clinicName ||
          "CA Smile Dental Clinic"
      );
      setMapCardImage(
        brandConfig.mapCardImage || "/images/ca-smile-clinic-building.jpg"
      );
      setMapPinPulse(brandConfig.mapPinPulse !== false);
      setMapPinColor(brandConfig.mapPinColor || "#E53935");

      if (brandConfig.hero) {
        const h = brandConfig.hero;
        setHeroVariant(h.heroVariant || "default");
        setBlankHeroTitle(h.blankHeroTitle || "");
        setBlankHeroSubtitle(h.blankHeroSubtitle || "");
        setBlankHeroCtaText(h.blankHeroCtaText || "");
        setBlankHeroCtaUrl(h.blankHeroCtaUrl || "/contact");
        setBlankHeroMinHeight(h.blankHeroMinHeight || "520px");
        setBlankHeroBgColor(h.blankHeroBgColor || "#ffffff");
        setBlankHeroTextColor(h.blankHeroTextColor || "#18181b");
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

  // Handle Map Speech Bubble Clinic Thumbnail Upload
  const handleMapCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setMapCardImage(dataUrl);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Live Hero Config Object for real-time preview
  const liveHeroConfig: HeroSectionConfig = {
    heroVariant,
    blankHeroTitle,
    blankHeroSubtitle,
    blankHeroCtaText,
    blankHeroCtaUrl,
    blankHeroMinHeight,
    blankHeroBgColor,
    blankHeroTextColor,
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

  // Save All Changes (Header + Hero + Map Location)
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
      address: clinicAddress.trim(),
      phone: clinicPhone.trim(),
      email: clinicEmail.trim(),
      latitude: parseFloat(String(latitude)) || 20.7636,
      longitude: parseFloat(String(longitude)) || 72.9680,
      mapSectionBgColor: mapSectionBgColor.trim() || "#ffffff",
      mapStyle: mapStyle,
      whatsappPhone: whatsappPhone.trim(),
      instagramUrl: instagramUrl.trim(),
      aboutVideoUrl: aboutVideoUrl.trim(),
      aboutSection: {
        videoUrl: aboutVideoUrl.trim(),
        videoTitle: aboutVideoTitle.trim(),
        videoSubtitle: aboutVideoSubtitle.trim(),
        badgeText: aboutBadgeText.trim(),
        autoplayOnScroll: aboutAutoplayOnScroll,
        videoSize: aboutVideoSize,
        defaultQuality: aboutDefaultQuality,
        hideYouTubeBranding: aboutHideYouTubeBranding,
        startMuted: aboutStartMuted,
        showStatusPill: aboutShowStatusPill,
      },
      googleMapsUrl: googleMapsUrl.trim(),
      mapExactAddress: mapExactAddress.trim(),
      mapSectionTitle: mapSectionTitle.trim() || "ADDRESS",
      mapCardTitle: mapCardTitle.trim() || "CA Smile Dental Clinic",
      mapCardImage: mapCardImage.trim() || "/images/ca-smile-clinic-building.jpg",
      mapPinPulse: mapPinPulse,
      mapPinColor: mapPinColor.trim() || "#E53935",
      logo: {
        ...brandConfig.logo,
        type: logoImageUrl ? "IMAGE" : "ICON",
        imageUrl: logoImageUrl,
        showClinicName: showClinicName,
        logoHeight: Number(logoHeight) || 36,
        logoSize: Number(logoHeight) || 36,
        clinicDisplayName: clinicDisplayName.trim() || "PedioDent",
        altText: `${clinicDisplayName.trim() || "PedioDent"} Clinic Logo`,
      },
      hero: liveHeroConfig,
      gallery: brandConfig.gallery || DEFAULT_GALLERY_CONFIG,
    });

    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4500);
    } else {
      setErrorMessage(
        "Failed to persist branding, hero & location settings. Please verify administrator rights."
      );
    }
  };

  // Reset to Factory Defaults
  const handleResetDefaults = async () => {
    if (
      !confirm(
        "Reset Header Branding, Hero Section, and Map Location to factory reference defaults?"
      )
    ) {
      return;
    }
    setSaving(true);
    setClinicDisplayName("CA Smile Dental Clinic");
    setHeaderBgColor("#18181b");
    setHeaderTextColor("#ffffff");
    setHeaderContactBtnBgColor("#8a0000");
    setHeaderContactBtnTextColor("#ffffff");
    setLogoImageUrl("/images/ca-smile-logo-light.png");
    setClinicAddress("1ST FLOOR LABDHI ARCADE, ABOVE HDFC BANK, BILIMORA");
    setClinicPhone("+91 72260 98074");
    setClinicEmail("casmileatbilimora@gmail.com");
    setLatitude(20.7636);
    setLongitude(72.9680);
    setMapSectionBgColor("#ffffff");
    setMapStyle("dark");
    setWhatsappPhone("+91 72260 98074");
    setInstagramUrl("https://instagram.com");
    setAboutVideoUrl("https://youtu.be/mbBugyspbPE");
    setGoogleMapsUrl(
      "https://www.google.com/maps/place/CA+Smile+Multispeciality+Dental+Clinic/data=!4m2!3m1!1s0x0:0x3a288255f324c8de?sa=X&ved=1t:2428&ictx=111"
    );
    setMapExactAddress(
      "1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank/ Krishna Dairy, Kutchhi Friends Society, Bilimora, Gujarat 396321"
    );
    setMapSectionTitle("ADDRESS");
    setMapCardTitle("CA Smile Dental Clinic");
    setMapCardImage("/images/ca-smile-clinic-building.jpg");
    setMapPinPulse(true);
    setMapPinColor("#E53935");

    // Reset Hero states
    setHeroVariant("default");
    setBlankHeroTitle("");
    setBlankHeroSubtitle("");
    setBlankHeroCtaText("");
    setBlankHeroCtaUrl("/contact");
    setBlankHeroMinHeight("520px");
    setBlankHeroBgColor("#ffffff");
    setBlankHeroTextColor("#18181b");
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
                <div className="flex items-center gap-2.5">
                  {logoImageUrl ? (
                    <div
                      className="flex items-center justify-center overflow-hidden rounded-lg bg-black/5 p-0.5 transition-all"
                      style={{ height: `${logoHeight}px`, width: "auto" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoImageUrl}
                        alt={clinicDisplayName}
                        className="object-contain rounded-md transition-all"
                        style={{ height: `${logoHeight}px`, width: "auto" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center rounded-lg bg-black text-white shadow-xs transition-all"
                      style={{ height: `${logoHeight}px`, width: `${logoHeight}px` }}
                    >
                      <ToothVectorIcon className="h-4 w-4" />
                    </div>
                  )}
                  {showClinicName && (
                    <span
                      className="font-heading text-sm sm:text-base font-bold tracking-tight truncate max-w-[130px] sm:max-w-[180px]"
                      style={{ color: headerTextColor }}
                    >
                      {clinicDisplayName || "PedioDent"}
                    </span>
                  )}
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
      <div className="flex items-center border-b border-brand-border overflow-x-auto whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors shrink-0 ${
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
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors shrink-0 ${
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
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors shrink-0 ${
            activeTab === "about"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          <Video className="h-4 w-4" />
          <span>About Us &amp; Video Player</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors shrink-0 ${
            activeTab === "details"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Location &amp; Clinic Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("blog")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors shrink-0 ${
            activeTab === "blog"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Blog &amp; Articles (Hide / Unhide &amp; Manage)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors shrink-0 ${
            activeTab === "gallery"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Space Gallery &amp; Polaroids (Photos, Story, Address &amp; Mascot)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HERO SECTION CUSTOMIZATION                                         */}
      {/* ========================================================================= */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          {/* 0. ACTIVE HERO SECTION SELECTOR */}
          <Card className="border-2 border-brand-primary/30 shadow-xs bg-linear-to-b from-brand-surface to-brand-surface/40">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white shadow-xs">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-brand-text">
                      Select Active Hero Section Style
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Choose which Hero Section variant displays on your public website. Switch instantly with real-time preview above.
                    </CardDescription>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="w-fit text-xs font-semibold px-2.5 py-1 bg-brand-primary/10 text-brand-primary border-brand-primary/30"
                >
                  Active:{" "}
                  {heroVariant === "default"
                    ? "Classic Doctor Hero"
                    : heroVariant === "blank1"
                    ? "Blank Hero Section 1"
                    : "Blank Hero Section 2 (Split)"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Option 1: Classic Doctor Cutout */}
                <div
                  onClick={() => setHeroVariant("default")}
                  className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                    heroVariant === "default"
                      ? "border-brand-primary bg-brand-primary/5 shadow-xs"
                      : "border-brand-border bg-brand-surface hover:border-brand-primary/50"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      {heroVariant === "default" ? (
                        <span className="flex items-center gap-1 rounded-full bg-brand-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                          <Check className="h-3 w-3 stroke-[3]" /> Selected
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-brand-muted">Click to select</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-text">
                        1. Classic Doctor Hero
                      </h4>
                      <p className="mt-1 text-xs text-brand-muted leading-relaxed">
                        Full-featured doctor cutout portrait, grand typography title, floating info badge, working hours &amp; location tags.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-muted">
                    <span className="font-semibold text-brand-primary">Full Design</span>
                    <span>Factory Default</span>
                  </div>
                </div>

                {/* Option 2: Blank Hero 1 */}
                <div
                  onClick={() => setHeroVariant("blank1")}
                  className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                    heroVariant === "blank1"
                      ? "border-brand-primary bg-brand-primary/5 shadow-xs"
                      : "border-brand-border bg-brand-surface hover:border-brand-primary/50"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200/80 text-zinc-700">
                        <Layout className="h-4 w-4" />
                      </div>
                      {heroVariant === "blank1" ? (
                        <span className="flex items-center gap-1 rounded-full bg-brand-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                          <Check className="h-3 w-3 stroke-[3]" /> Selected
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-brand-muted">Click to select</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-text">
                        2. Blank Hero Section 1
                      </h4>
                      <p className="mt-1 text-xs text-brand-muted leading-relaxed">
                        Clean, pristine minimalist blank hero container. Ideal for clean banners, minimalistic introductions, or fresh custom designs.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-muted">
                    <span className="font-semibold text-emerald-600">Blank Page / Minimal</span>
                    <span>Option 2</span>
                  </div>
                </div>

                {/* Option 3: Blank Hero 2 (Split) */}
                <div
                  onClick={() => setHeroVariant("blank2")}
                  className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                    heroVariant === "blank2"
                      ? "border-brand-primary bg-brand-primary/5 shadow-xs"
                      : "border-brand-border bg-brand-surface hover:border-brand-primary/50"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200/80 text-zinc-700">
                        <Columns className="h-4 w-4" />
                      </div>
                      {heroVariant === "blank2" ? (
                        <span className="flex items-center gap-1 rounded-full bg-brand-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                          <Check className="h-3 w-3 stroke-[3]" /> Selected
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-brand-muted">Click to select</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-text">
                        3. Blank Hero Section 2
                      </h4>
                      <p className="mt-1 text-xs text-brand-muted leading-relaxed">
                        Modern two-column split blank hero layout. Left panel for text/brand introduction, right panel for media/imagery.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-muted">
                    <span className="font-semibold text-purple-600">Split Canvas</span>
                    <span>Option 3</span>
                  </div>
                </div>
              </div>

              {/* Sub-settings if Blank Hero 1 or 2 is active */}
              {(heroVariant === "blank1" || heroVariant === "blank2") && (
                <div className="mt-4 rounded-xl border border-brand-border/80 bg-brand-surface/70 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-brand-primary" />
                      <span className="text-xs font-bold text-brand-text">
                        {heroVariant === "blank1" ? "Blank Hero 1 Customization" : "Blank Hero 2 (Split) Customization"}
                      </span>
                    </div>
                    <span className="text-[11px] text-brand-muted">Leave text blank to display empty canvas</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-text">Optional Headline / Title</label>
                      <Input
                        value={blankHeroTitle}
                        onChange={(e) => setBlankHeroTitle(e.target.value)}
                        placeholder="Leave blank for empty canvas"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-text">Optional Subtitle</label>
                      <Input
                        value={blankHeroSubtitle}
                        onChange={(e) => setBlankHeroSubtitle(e.target.value)}
                        placeholder="Leave blank for empty canvas"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-text">Optional CTA Button Text</label>
                      <Input
                        value={blankHeroCtaText}
                        onChange={(e) => setBlankHeroCtaText(e.target.value)}
                        placeholder="Leave blank for no button"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-text">Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={blankHeroBgColor}
                          onChange={(e) => setBlankHeroBgColor(e.target.value)}
                          className="h-8 w-8 rounded-lg cursor-pointer border border-brand-border"
                        />
                        <Input
                          value={blankHeroBgColor}
                          onChange={(e) => setBlankHeroBgColor(e.target.value)}
                          placeholder="#ffffff"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-text">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={blankHeroTextColor}
                          onChange={(e) => setBlankHeroTextColor(e.target.value)}
                          className="h-8 w-8 rounded-lg cursor-pointer border border-brand-border"
                        />
                        <Input
                          value={blankHeroTextColor}
                          onChange={(e) => setBlankHeroTextColor(e.target.value)}
                          placeholder="#18181b"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-brand-text">Min Height</label>
                      <Input
                        value={blankHeroMinHeight}
                        onChange={(e) => setBlankHeroMinHeight(e.target.value)}
                        placeholder="520px"
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
          {/* 1. CLINIC BRAND DISPLAY NAME & LOGO SIZE */}
          <Card className="border border-brand-border shadow-xs md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <Type className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">1. Clinic Display Name &amp; Logo Size</CardTitle>
                    <CardDescription className="text-xs">
                      Manage clinic name visibility in the navbar and adjust the logo size
                    </CardDescription>
                  </div>
                </div>

                {/* Show / Remove Toggle Badge */}
                <div className="flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface p-1">
                  <button
                    type="button"
                    onClick={() => setShowClinicName(true)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      showClinicName
                        ? "bg-brand-primary text-white shadow-xs"
                        : "text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <span>Show Name</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClinicName(false)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      !showClinicName
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <span>Remove Name</span>
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Visibility Status Alert */}
              <div
                className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                  showClinicName
                    ? "border-emerald-500/20 bg-emerald-50/50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
                    : "border-amber-500/20 bg-amber-50/50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      showClinicName ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="font-medium">
                    {showClinicName
                      ? "Clinic Display Name is currently visible in the header navbar."
                      : "Clinic Display Name is removed/hidden. Only the logo will appear in the navbar."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClinicName(!showClinicName)}
                  className="font-bold underline hover:no-underline text-xs"
                >
                  {showClinicName ? "Click to Remove" : "Click to Show"}
                </button>
              </div>

              {/* Clinic Display Name Input (Only relevant if showClinicName is true) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-brand-text">
                    Clinic Display Name
                  </label>
                  {!showClinicName && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      (Hidden in Navbar)
                    </span>
                  )}
                </div>
                <Input
                  value={clinicDisplayName}
                  onChange={(e) => setClinicDisplayName(e.target.value)}
                  placeholder="e.g. CA Smile"
                  disabled={!showClinicName}
                  className={`text-sm font-medium ${
                    !showClinicName ? "opacity-50 cursor-not-allowed bg-muted/40" : ""
                  }`}
                />
              </div>

              {showClinicName && (
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-muted">Quick suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["CA Smile", "CA Smile Dental Clinic", "PedioDent", "Smile Care Center"].map(
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
              )}

              {/* Logo Size Control Section */}
              <div className="border-t border-brand-border/60 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-brand-text">
                      Navbar Logo Size
                    </label>
                    <p className="text-[11px] text-brand-muted">
                      Adjust the physical height and scale of the logo in the header
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md border border-brand-primary/20">
                    {logoHeight}px
                  </span>
                </div>

                {/* Size Range Slider */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-brand-muted">24px</span>
                  <input
                    type="range"
                    min="24"
                    max="64"
                    step="2"
                    value={logoHeight}
                    onChange={(e) => setLogoHeight(Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                  />
                  <span className="text-[11px] font-mono text-brand-muted">64px</span>
                </div>

                {/* Quick Size Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-brand-muted">Presets:</span>
                  {[
                    { label: "Small (28px)", size: 28 },
                    { label: "Standard (36px)", size: 36 },
                    { label: "Medium (42px)", size: 42 },
                    { label: "Large (48px)", size: 48 },
                    { label: "X-Large (56px)", size: 56 },
                  ].map((preset) => (
                    <button
                      key={preset.size}
                      type="button"
                      onClick={() => setLogoHeight(preset.size)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        logoHeight === preset.size
                          ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-xs"
                          : "border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
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
      {/* TAB 3: ABOUT US & VIDEO PLAYER CUSTOMIZER                                 */}
      {/* ========================================================================= */}
      {activeTab === "about" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-2xl border border-brand-border bg-gradient-to-r from-teal-500/10 via-brand-surface to-brand-surface p-5 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-brand-text">
                    About Us Page &amp; Video Player Customizer
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Full administrative control over the clinic tour video, YouTube branding removal, autoplay behavior, size presets, resolution quality, and page headings.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="w-fit text-xs px-3 py-1 bg-white font-medium">
                Live Dynamic Sync
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 1. VIDEO SOURCE LINK */}
            <Card className="border border-brand-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                      <Video className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">1. Video Source &amp; Link</CardTitle>
                      <CardDescription className="text-xs">
                        Set YouTube URL or direct MP4/WebM video stream
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {aboutVideoUrl.endsWith(".mp4") ? "Direct MP4" : "YouTube"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Video URL
                  </label>
                  <Input
                    value={aboutVideoUrl}
                    onChange={(e) => setAboutVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=mbBugyspbPE"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-brand-muted">
                    Supports standard YouTube links, Shorts, or direct video file URLs (.mp4).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAboutVideoUrl("/videos/clinic-tour-1080p.mp4")}
                    className="text-xs gap-1.5 rounded-lg border-teal-600/40 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30"
                  >
                    <Sparkles className="h-3 w-3 text-teal-600" />
                    <span>Use 1080p Master File (/videos/clinic-tour-1080p.mp4)</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAboutVideoUrl("https://www.youtube.com/watch?v=mbBugyspbPE")}
                    className="text-xs gap-1.5 rounded-lg"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>YouTube URL (mbBugyspbPE)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 2. YOUTUBE BRANDING & WATERMARK SUPPRESSION */}
            <Card className="border border-brand-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">2. YouTube Branding Removal</CardTitle>
                      <CardDescription className="text-xs">
                        Hide top channel avatar header and bottom YouTube logo
                      </CardDescription>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAboutHideYouTubeBranding(!aboutHideYouTubeBranding)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      aboutHideYouTubeBranding
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    <span>{aboutHideYouTubeBranding ? "Branding Hidden" : "Standard Embed"}</span>
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className={`rounded-xl border p-3.5 text-xs transition-colors ${
                    aboutHideYouTubeBranding
                      ? "border-emerald-500/20 bg-emerald-50/50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
                      : "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900"
                  }`}
                >
                  <p className="font-semibold mb-1">
                    {aboutHideYouTubeBranding
                      ? "✓ Clean Professional Mask Active"
                      : "Native YouTube Overlays Allowed"}
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {aboutHideYouTubeBranding
                      ? "The top channel avatar (\"My Video / yash patel\") and the bottom YouTube watermark logo are cropped and shielded. Users will only see your clean video with realistic white controls."
                      : "Native YouTube top title bar and bottom watermark will be displayed normally."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 3. AUTOPLAY & PLAYBACK BEHAVIOR */}
            <Card className="border border-brand-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">3. Autoplay &amp; Playback Controls</CardTitle>
                    <CardDescription className="text-xs">
                      Scroll-triggered autoplay and interaction behavior
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Autoplay on Scroll Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-brand-border p-3">
                  <div>
                    <span className="text-xs font-semibold text-brand-text block">
                      Autoplay on Scroll
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      Video automatically starts playing when scrolled into viewport
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAboutAutoplayOnScroll(!aboutAutoplayOnScroll)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      aboutAutoplayOnScroll
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    {aboutAutoplayOnScroll ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {/* Start Muted Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-brand-border p-3">
                  <div>
                    <span className="text-xs font-semibold text-brand-text block">
                      Start Muted
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      Required by modern browsers (Safari, Chrome) to allow autoplay
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAboutStartMuted(!aboutStartMuted)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      aboutStartMuted
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    {aboutStartMuted ? "Muted" : "Unmuted"}
                  </button>
                </div>

                {/* Show Status Pill */}
                <div className="flex items-center justify-between rounded-xl border border-brand-border p-3">
                  <div>
                    <span className="text-xs font-semibold text-brand-text block">
                      Show Playing Status Pill
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      Pill displaying &quot;Clinic Tour • Playing&quot; or &quot;Paused&quot;
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAboutShowStatusPill(!aboutShowStatusPill)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      aboutShowStatusPill
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    {aboutShowStatusPill ? "Visible" : "Hidden"}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 4. VIDEO SIZE SETTINGS ("SLIDE CUM" / COMPACT PRESETS) */}
            <Card className="border border-brand-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                    <Columns className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">4. Video Player Size</CardTitle>
                    <CardDescription className="text-xs">
                      Adjust container width on the About Us page
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { key: "max-w-4xl", label: "Compact", note: "896px (Slide Cum)" },
                    { key: "max-w-5xl", label: "Standard", note: "1024px (Medium)" },
                    { key: "max-w-6xl", label: "Navbar Wide", note: "1152px (Navbar)" },
                    { key: "max-w-full", label: "Full Width", note: "100% Container" },
                  ].map((sizeOption) => (
                    <button
                      key={sizeOption.key}
                      type="button"
                      onClick={() => setAboutVideoSize(sizeOption.key as any)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                        aboutVideoSize === sizeOption.key
                          ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold shadow-xs ring-1 ring-teal-500"
                          : "border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      <span className="text-xs">{sizeOption.label}</span>
                      <span className="text-[10px] text-brand-muted mt-0.5">{sizeOption.note}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-brand-muted pt-1">
                  Currently selected: <span className="font-bold text-teal-600">{aboutVideoSize}</span>. The Compact size provides comfortable side margins beneath the navbar.
                </p>
              </CardContent>
            </Card>

            {/* 5. VIDEO QUALITY CONTROL (INCREASE / DECREASE) */}
            <Card className="border border-brand-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">5. Playback Quality Control</CardTitle>
                    <CardDescription className="text-xs">
                      Lock video playback resolution (Increase to 1080p Full HD)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { key: "hd1080", label: "1080p Full HD", desc: "Highest Clarity" },
                    { key: "hd720", label: "720p HD", desc: "Fast & Sharp" },
                    { key: "medium", label: "480p SD", desc: "Data Saver" },
                    { key: "auto", label: "Auto Quality", desc: "Adaptive Bitrate" },
                  ].map((q) => (
                    <button
                      key={q.key}
                      type="button"
                      onClick={() => setAboutDefaultQuality(q.key as any)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                        aboutDefaultQuality === q.key
                          ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold shadow-xs ring-1 ring-teal-500"
                          : "border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      <span className="text-xs">{q.label}</span>
                      <span className="text-[10px] text-brand-muted mt-0.5">{q.desc}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-brand-muted pt-1">
                  Enforces maximum resolution quality via YouTube IFrame API and HTML parameters.
                </p>
              </CardContent>
            </Card>

            {/* 6. ABOUT US PAGE HEADINGS & LABELS */}
            <Card className="border border-brand-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                    <Type className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">6. About Page Headings &amp; Badges</CardTitle>
                    <CardDescription className="text-xs">
                      Customize titles shown directly above the video player
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text">
                    Main Section Heading
                  </label>
                  <Input
                    value={aboutVideoTitle}
                    onChange={(e) => setAboutVideoTitle(e.target.value)}
                    placeholder="Take a Look Inside Our Clinic"
                    className="text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text">
                    Category Tag / Subtitle
                  </label>
                  <Input
                    value={aboutVideoSubtitle}
                    onChange={(e) => setAboutVideoSubtitle(e.target.value)}
                    placeholder="Clinic Tour & Experience"
                    className="text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text">
                    Feature Badge Caption
                  </label>
                  <Input
                    value={aboutBadgeText}
                    onChange={(e) => setAboutBadgeText(e.target.value)}
                    placeholder="Autoplays on scroll • Interactive play & pause"
                    className="text-xs font-medium"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 7. INTERACTIVE LIVE PREVIEW */}
          <Card className="border border-brand-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Interactive Live Video Preview</CardTitle>
                  <CardDescription className="text-xs">
                    Test the video, controls, size, and YouTube branding suppression in real-time
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-medium">
                  {aboutVideoSize} • {aboutDefaultQuality}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-neutral-950 p-4 sm:p-8 flex flex-col items-center justify-center">
                <div className="w-full text-center sm:text-left mb-4 max-w-4xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                    {aboutVideoSubtitle}
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    {aboutVideoTitle}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    {aboutBadgeText}
                  </p>
                </div>

                {/* Render live player with current admin settings */}
                <AboutVideoPlayer
                  config={{
                    videoUrl: aboutVideoUrl,
                    videoTitle: aboutVideoTitle,
                    videoSubtitle: aboutVideoSubtitle,
                    badgeText: aboutBadgeText,
                    autoplayOnScroll: aboutAutoplayOnScroll,
                    videoSize: aboutVideoSize,
                    defaultQuality: aboutDefaultQuality,
                    hideYouTubeBranding: aboutHideYouTubeBranding,
                    startMuted: aboutStartMuted,
                    showStatusPill: aboutShowStatusPill,
                  }}
                  videoUrl={aboutVideoUrl}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Save Bar for About Us & Video Player */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20 p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-text">
                  Save About Us &amp; Video Player Configuration
                </p>
                <p className="text-[11px] text-brand-muted">
                  Instantly updates public /about page video, autoplay, sizing, quality, and headings.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-md gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Video Settings...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save About Video Settings</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LOCATION & CLINIC DETAILS (MAP SECTION CUSTOMIZATION)              */}
      {/* ========================================================================= */}
      {activeTab === "details" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-2xl border border-brand-border bg-linear-to-r from-brand-primary/10 via-brand-surface to-brand-surface p-5 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-brand-text">
                    Clinic Map Section &amp; Location Customizer
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Full control over the public website Map Section: background color, map theme, WhatsApp &amp; Instagram links, address details, and pin styling.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="w-fit text-xs px-3 py-1 bg-white font-medium">
                Live Public Website Connected
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 1. MAP SECTION VISUAL DESIGN & THEME */}
            <Card className="border border-brand-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-brand-primary" />
                  <CardTitle className="text-sm font-semibold">Map Section Visual Design &amp; Theme</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Background color of the map section, road map visual theme, and pin styling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Background Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Map Section Background Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={mapSectionBgColor}
                      onChange={(e) => setMapSectionBgColor(e.target.value)}
                      className="h-9 w-10 cursor-pointer rounded-lg border border-brand-border bg-transparent p-0.5"
                    />
                    <Input
                      value={mapSectionBgColor}
                      onChange={(e) => setMapSectionBgColor(e.target.value)}
                      className="font-mono text-xs max-w-[140px]"
                      placeholder="#ffffff"
                    />
                    <div className="flex items-center gap-1.5">
                      {[
                        { name: "White", color: "#ffffff" },
                        { name: "Cream", color: "#eae6df" },
                        { name: "Soft Grey", color: "#f8fafc" },
                        { name: "Beige", color: "#f5f5f4" },
                        { name: "Dark", color: "#18181b" },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => setMapSectionBgColor(preset.color)}
                          className={`h-6 w-6 rounded-full border shadow-2xs transition-transform hover:scale-110 ${
                            mapSectionBgColor.toLowerCase() === preset.color.toLowerCase()
                              ? "ring-2 ring-brand-primary ring-offset-1"
                              : "border-black/20"
                          }`}
                          style={{ backgroundColor: preset.color }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Map Design / Style */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-brand-text">
                    Map Design / Theme Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMapStyle("dark")}
                      className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                        mapStyle === "dark"
                          ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
                          : "border-brand-border bg-brand-surface hover:border-brand-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-brand-text">Dark Road Map</span>
                        {mapStyle === "dark" && <Check className="h-3.5 w-3.5 text-brand-primary" />}
                      </div>
                      <span className="text-[11px] text-brand-muted">
                        High-contrast dark monochrome road canvas
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMapStyle("light")}
                      className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                        mapStyle === "light"
                          ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
                          : "border-brand-border bg-brand-surface hover:border-brand-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-brand-text">Standard Light Map</span>
                        {mapStyle === "light" && <Check className="h-3.5 w-3.5 text-brand-primary" />}
                      </div>
                      <span className="text-[11px] text-brand-muted">
                        Natural crisp daylight Google road map
                      </span>
                    </button>
                  </div>
                </div>

                {/* Pin Color & Pulse Animation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text">
                      Map Pin Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={mapPinColor}
                        onChange={(e) => setMapPinColor(e.target.value)}
                        className="h-8 w-9 cursor-pointer rounded-lg border border-brand-border bg-transparent p-0.5"
                      />
                      <Input
                        value={mapPinColor}
                        onChange={(e) => setMapPinColor(e.target.value)}
                        className="font-mono text-xs"
                        placeholder="#E53935"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-text">
                      Pin Pulsing Radar Halo
                    </label>
                    <button
                      type="button"
                      onClick={() => setMapPinPulse(!mapPinPulse)}
                      className={`flex h-9 w-full items-center justify-between rounded-lg border px-3 text-xs font-medium transition-all ${
                        mapPinPulse
                          ? "border-emerald-500/40 bg-emerald-50 text-emerald-800"
                          : "border-brand-border bg-brand-surface text-brand-muted"
                      }`}
                    >
                      <span>{mapPinPulse ? "Blinking Pulse Enabled" : "Static Pin (No Pulse)"}</span>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          mapPinPulse ? "bg-emerald-500 animate-pulse" : "bg-stone-300"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. SOCIAL MEDIA & DIRECT CONTACT LINKS */}
            <Card className="border border-brand-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-primary" />
                  <CardTitle className="text-sm font-semibold">Social Media &amp; Quick Contact Links</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Buttons displayed directly in the left column of the map section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {/* WhatsApp */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-brand-text flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[9px] font-bold">W</span>
                    WhatsApp Phone Number or Link
                  </label>
                  <Input
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="text-xs font-mono"
                    placeholder="+91 72260 98074 or https://wa.me/..."
                  />
                  <span className="text-[10px] text-brand-muted">
                    Clicking the WhatsApp button opens direct chat with this phone number.
                  </span>
                </div>

                {/* Instagram */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-brand-text flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-linear-to-tr from-amber-500 via-rose-500 to-purple-600 text-white text-[9px] font-bold">IG</span>
                    Instagram Profile Link
                  </label>
                  <Input
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="text-xs font-mono"
                    placeholder="https://instagram.com/casmiledental"
                  />
                  <span className="text-[10px] text-brand-muted">
                    Clicking the Instagram icon button opens this URL in a new tab.
                  </span>
                </div>

                {/* About Us Video URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-brand-text flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white text-[9px] font-bold">▶</span>
                    About Us YouTube Video URL
                  </label>
                  <Input
                    value={aboutVideoUrl}
                    onChange={(e) => setAboutVideoUrl(e.target.value)}
                    className="text-xs font-mono"
                    placeholder="https://youtu.be/mbBugyspbPE"
                  />
                  <span className="text-[10px] text-brand-muted">
                    Plays on loop automatically when scrolled into view on the About Us page (no YouTube badges or profiles).
                  </span>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-brand-text">
                      Reception Phone Number
                    </label>
                    <Input
                      value={clinicPhone}
                      onChange={(e) => setClinicPhone(e.target.value)}
                      className="text-xs font-mono"
                      placeholder="+91 72260 98074"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-brand-text">
                      Clinic Contact Email
                    </label>
                    <Input
                      value={clinicEmail}
                      onChange={(e) => setClinicEmail(e.target.value)}
                      className="text-xs font-mono"
                      placeholder="casmileatbilimora@gmail.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. PHYSICAL ADDRESS & GOOGLE MAPS NAVIGATION */}
            <Card className="border border-brand-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-primary" />
                  <CardTitle className="text-sm font-semibold">Physical Address &amp; Navigation</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Address strings used for text display, Google Maps pin sticking, and navigation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-brand-text">
                    Section Header Label
                  </label>
                  <Input
                    value={mapSectionTitle}
                    onChange={(e) => setMapSectionTitle(e.target.value)}
                    className="text-xs"
                    placeholder="ADDRESS"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-brand-text">
                    Display Address (Short Header)
                  </label>
                  <Input
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    className="text-xs"
                    placeholder="1ST FLOOR LABDHI ARCADE, ABOVE HDFC BANK, BILIMORA"
                  />
                  <span className="text-[10px] text-brand-muted">
                    Shown prominently on the left column and the top floating map pill.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-brand-text">
                    Exact Location Address (For Stuck Map Pin &amp; Embed)
                  </label>
                  <textarea
                    rows={2}
                    value={mapExactAddress}
                    onChange={(e) => setMapExactAddress(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-brand-surface p-2 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    placeholder="1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank/ Krishna Dairy, Kutchhi Friends Society, Bilimora, Gujarat 396321"
                  />
                  <span className="text-[10px] text-brand-muted">
                    Google Maps embed and speech-bubble card stick exactly to this location.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-brand-text">
                    Google Maps Place / Directions URL
                  </label>
                  <Input
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    className="text-xs font-mono"
                    placeholder="https://www.google.com/maps/place/..."
                  />
                  <span className="text-[10px] text-brand-muted">
                    Target destination when clicking &quot;Get Directions&quot; or &quot;OPEN MAP&quot;.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-brand-muted">Latitude</label>
                    <Input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-brand-muted">Longitude</label>
                    <Input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. SPEECH-BUBBLE CLINIC CARD */}
            <Card className="border border-brand-border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-brand-primary" />
                  <CardTitle className="text-sm font-semibold">Floating Clinic Speech-Bubble Card</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Customize the clinic card that points directly to the red pin on the map
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-brand-text">
                    Clinic Name on Speech Bubble
                  </label>
                  <Input
                    value={mapCardTitle}
                    onChange={(e) => setMapCardTitle(e.target.value)}
                    className="text-xs"
                    placeholder="CA Smile Dental Clinic"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-brand-text">
                    Storefront Entrance Thumbnail
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-brand-border bg-stone-100">
                      {mapCardImage ? (
                        <img
                          src={mapCardImage}
                          alt="Clinic thumbnail preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Input
                        value={mapCardImage}
                        onChange={(e) => setMapCardImage(e.target.value)}
                        className="text-xs font-mono"
                        placeholder="/images/ca-smile-clinic-building.jpg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => mapCardImageInputRef.current?.click()}
                        className="h-7 gap-1.5 text-[11px]"
                      >
                        <Upload className="h-3 w-3" />
                        <span>Upload Photo</span>
                      </Button>
                      <input
                        ref={mapCardImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMapCardImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Info Box */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-950">
                  <div className="font-semibold mb-0.5">Interactive Map Behavior:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-blue-900">
                    <li>The speech bubble card points down to the teardrop location pin.</li>
                    <li>Clicking the speech bubble opens your Google Maps page.</li>
                    <li>Zoom controls are locked to maintain focus on your exact clinic address.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 5. LIVE REAL-TIME PREVIEW OF THE MAP SECTION */}
          <Card className="border border-brand-border shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-brand-border bg-stone-50/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-brand-primary" />
                  <CardTitle className="text-sm font-semibold">Live Real-Time Map Section Preview</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white">
                  Real-time visual reflection
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6" style={{ backgroundColor: mapSectionBgColor }}>
              <div className="rounded-2xl border border-black/10 p-4 sm:p-6 shadow-sm">
                <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                  {/* Left Column Preview */}
                  <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
                    <div className="space-y-3">
                      <div className="text-xs font-black tracking-[0.25em] text-[#18181b] uppercase">
                        {mapSectionTitle || "ADDRESS"}
                      </div>
                      <div className="space-y-1.5 text-xs text-[#18181b]/90">
                        <div className="font-medium text-[#27272a]">{clinicEmail || "casmileatbilimora@gmail.com"}</div>
                        <div className="font-bold uppercase tracking-wide text-[#18181b] max-w-sm">
                          {clinicAddress || "1ST FLOOR LABDHI ARCADE, ABOVE HDFC BANK, BILIMORA"}
                        </div>
                        <div className="font-bold text-[#18181b] pt-0.5">{clinicPhone || "+91 72260 98074"}</div>
                      </div>
                      <div className="flex items-center gap-2.5 pt-1">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b] text-white shadow-xs"
                          title="Instagram Link"
                        >
                          <span className="text-[9px] font-bold">IG</span>
                        </div>
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b] text-white shadow-xs"
                          title="WhatsApp Link"
                        >
                          <span className="text-[9px] font-bold">WA</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#18181b] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#18181b]">
                        <span>Get Directions</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column Map Canvas Preview */}
                  <div className="lg:col-span-7">
                    <div
                      className="relative w-full h-[260px] sm:h-[300px] overflow-hidden rounded-[20px] border border-black/15 shadow-md flex items-center justify-center"
                      style={{ backgroundColor: mapStyle === "dark" ? "#2b2d30" : "#e2e8f0" }}
                    >
                      {/* Top floating pill */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between rounded-full bg-white/95 px-3 py-1.5 shadow-xs border border-black/5 text-[10px]">
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <MapPin className="h-3 w-3 shrink-0" style={{ color: mapPinColor, fill: mapPinColor }} />
                          <span className="truncate font-bold uppercase text-slate-800">
                            {clinicAddress || "BILIMORA CLINIC"}
                          </span>
                        </div>
                        <span className="shrink-0 font-black text-[#0891b2] text-[9px]">OPEN MAP &gt;</span>
                      </div>

                      {/* Map Simulated Streets */}
                      <div className="absolute inset-0 opacity-40 flex items-center justify-center">
                        <div className="h-full w-full bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />
                      </div>

                      {/* Floating Speech Bubble and Pin */}
                      <div className="relative z-20 flex flex-col items-center">
                        <div className="rounded-xl bg-white p-2 shadow-lg border border-black/10 max-w-[240px]">
                          <div className="flex items-center gap-2">
                            {mapCardImage && (
                              <img
                                src={mapCardImage}
                                alt="Thumb"
                                className="h-10 w-12 rounded object-cover border border-stone-200"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold truncate" style={{ color: mapPinColor }}>
                                {mapCardTitle || "CA Smile Dental Clinic"}
                              </div>
                              <div className="text-[9px] text-stone-600 line-clamp-1">
                                {mapExactAddress || "Bilimora, Gujarat"}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Pin with Pulse */}
                        <div className="relative mt-2 flex flex-col items-center">
                          {mapPinPulse && (
                            <span
                              className="h-10 w-10 rounded-full animate-ping absolute opacity-30"
                              style={{ backgroundColor: mapPinColor }}
                            />
                          )}
                          <div
                            className="h-7 w-5 rounded-t-full rounded-b-none relative flex items-center justify-center shadow-md"
                            style={{ backgroundColor: mapPinColor }}
                          >
                            <span className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BLOG & ARTICLES MANAGEMENT                                         */}
      {/* ========================================================================= */}
      {activeTab === "blog" && (
        <div className="space-y-6">
          <ClinicBrandingBlogManager />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CLINIC SPACE GALLERY & POLAROIDS SHOWCASE                          */}
      {/* ========================================================================= */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          <ClinicBrandingGalleryManager />
        </div>
      )}

      {/* Save Action Sticky Footer (for Hero, Header, About, and Details tabs) */}
      {activeTab !== "blog" && activeTab !== "gallery" && (
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
      )}
    </div>
  );
}
