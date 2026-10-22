export type LogoType = "ICON" | "IMAGE" | "MONOGRAM";

export type LogoShape = "rounded" | "circle" | "square";

export type LogoIconName =
  | "Stethoscope"
  | "Activity"
  | "HeartPulse"
  | "ShieldCheck"
  | "Smile"
  | "Cross"
  | "Sparkles"
  | "Building2"
  | "Pill"
  | "Eye"
  | "Hospital";

export interface ClinicLogoConfig {
  type: LogoType;
  iconName: LogoIconName;
  imageUrl: string; // Base64 data URL or HTTP URL or relative path
  monogramText: string; // e.g. "HS" or "VS"
  shape: LogoShape;
  altText: string;
  showClinicName: boolean;
  clinicDisplayName: string;
  mobileClinicDisplayName?: string;
  tagline: string;
}

export interface HeroSectionConfig {
  // Top Information Row (Working hours on left, Location on right on top of image)
  topInfoEnabled?: boolean;
  topInfoWorkingHoursLabel?: string;
  topInfoWorkingHoursValue?: string;
  topInfoLocationLabel?: string;
  topInfoLocationValue?: string;
  topInfoTextColor?: string;
  topInfoLabelColor?: string;
  topInfoMarginTop?: string;

  // Upper Grand Title ("DENTAL CARE")
  upperText?: string;
  upperTextColor?: string;
  upperTextLetterSpacing?: string;
  showUpperText?: boolean;

  // Center Doctor Cutout Image (Desktop & Tablet)
  imageUrl: string;
  imageAltText?: string;
  imageWidth?: string;
  imageHeight?: string;
  imageBorderRadius?: string;
  imageBottomFade?: boolean;
  imageFit?: "cover" | "contain";
  imagePosition?: string;
  heroMinHeight?: string;

  // Dedicated Mobile Hero Image Configuration
  mobileImageUrl?: string;
  mobileImageFit?: "cover" | "contain" | "fill";
  mobileImageHeight?: string;
  mobileImageWidth?: string;
  mobileImageFullWidth?: boolean;
  mobileImageSpanBehindNavbar?: boolean;
  mobileImageBorderRadius?: string;
  mobileImageBottomFade?: boolean;
  mobileContentPlacement?: string;
  imageOverlayOpacity?: number;

  // Subtitle / Description Text & Positioning
  subtitleText: string;
  subtitleTextColor?: string;
  subtitleBoxMarginTop?: string;
  subtitleBoxMarginBottom?: string;

  // Appointment CTA Button
  ctaButtonText: string;
  ctaButtonUrl: string;
  ctaButtonBgColor: string;
  ctaButtonTextColor: string;
  ctaButtonBorderRadius?: string;
  ctaButtonShowIcon?: boolean;
  ctaButtonStyle?: "badge-arrow" | "classic";
  ctaButtonBadgeBgColor?: string;
  ctaButtonBadgeIconColor?: string;

  // Floating Doctor Info Box & Positioning
  doctorBoxEnabled: boolean;
  doctorBoxName: string;
  doctorBoxRole: string;
  doctorBoxShowRole: boolean;
  doctorBoxExperience: string;
  doctorBoxShowExperience: boolean;
  doctorBoxPhotoUrl?: string;
  doctorBoxShowPhoto: boolean;
  doctorBoxBgColor?: string;
  doctorBoxTextColor?: string;
  doctorBoxBorderRadius?: string;
  doctorBoxMarginTop?: string;
  doctorBoxMarginBottom?: string;

  // Background & decorative aura ring
  backgroundColor?: string;
  showAuraCircle?: boolean;
  auraCircleColor?: string;
}

export const DEFAULT_HERO_CONFIG: HeroSectionConfig = {
  topInfoEnabled: true,
  topInfoWorkingHoursLabel: "Working hours",
  topInfoWorkingHoursValue: "Mon - Sat 8:00-20:00",
  topInfoLocationLabel: "Location",
  topInfoLocationValue: "12 Shevchenko Street, Kyiv",
  topInfoTextColor: "#18181b",
  topInfoLabelColor: "#64748b",
  topInfoMarginTop: "0px",
  upperText: "DENTAL CARE",
  upperTextColor: "#000000",
  upperTextLetterSpacing: "0.14em",
  showUpperText: true,
  imageUrl: "/images/hero-doctor-dental-care.png",
  mobileImageUrl: "/images/hero-doctor-mobile.png",
  mobileImageFit: "cover",
  mobileImageHeight: "440px",
  mobileImageWidth: "100%",
  mobileImageFullWidth: true,
  mobileImageSpanBehindNavbar: false,
  mobileImageBorderRadius: "0px",
  mobileImageBottomFade: true,
  imageAltText: "Doctor with healthy smile and modern dental care",
  imageWidth: "560px",
  imageHeight: "560px",
  imageBorderRadius: "0px",
  imageBottomFade: true,
  imageFit: "cover",
  imagePosition: "center",
  heroMinHeight: "580px",
  imageOverlayOpacity: 0,
  subtitleText:
    "Discover advanced care, personalized treatments, and trusted experts in a gentle, modern environment",
  subtitleTextColor: "#475569",
  subtitleBoxMarginTop: "0px",
  subtitleBoxMarginBottom: "0px",
  ctaButtonText: "Book Your Appointment",
  ctaButtonUrl: "/book",
  ctaButtonBgColor: "#050505",
  ctaButtonTextColor: "#ffffff",
  ctaButtonBorderRadius: "14px",
  ctaButtonShowIcon: true,
  ctaButtonStyle: "badge-arrow",
  ctaButtonBadgeBgColor: "#ffffff",
  doctorBoxEnabled: true,
  doctorBoxName: "Dr. Alex Mercer",
  doctorBoxRole: "Senior Dental Specialist",
  doctorBoxShowRole: true,
  doctorBoxExperience: "8+ Years of Experience (4.9 ★ Rating)",
  doctorBoxShowExperience: true,
  doctorBoxPhotoUrl: "/images/hero-doctor-dental-care.png",
  doctorBoxShowPhoto: true,
  doctorBoxBgColor: "rgba(148, 153, 162, 0.92)",
  doctorBoxTextColor: "#ffffff",
  doctorBoxBorderRadius: "20px",
  doctorBoxMarginTop: "0px",
  doctorBoxMarginBottom: "0px",
  backgroundColor: "#ffffff",
  showAuraCircle: false,
  auraCircleColor: "#d1d5db",
};

export interface ClinicBrandConfig {
  themeKey: string;
  clinicName: string;
  slug: string;
  email: string;
  phone: string;
  emergencyPhone?: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  mapZoom?: number;
  workingHours?: string;
  doctorName?: string;
  doctorTitle?: string;
  doctorBio?: string;
  doctorPhone?: string;
  ownerName?: string;
  ownerTitle?: string;
  ownerBio?: string;
  logo: ClinicLogoConfig;
  headerBgColor?: string; // Customizable header background color
  headerTextColor?: string; // Customizable header text/link color
  headerContactBtnBgColor?: string; // Customizable header contact button background color
  headerContactBtnTextColor?: string; // Customizable header contact button text color
  hero?: HeroSectionConfig; // Customizable Hero Page Section
}

export const DEFAULT_CLINIC_BRANDING: ClinicBrandConfig = {
  themeKey: "teal-serenity",
  clinicName: "PedioDent",
  slug: "pediodent-main",
  email: "contact@pediodent.example.com",
  phone: "(800) 555-CLINIC",
  emergencyPhone: "(800) 555-CLINIC",
  address: "742 Evergreen Medical Way, Suite 400",
  city: "Springfield",
  state: "OR",
  postalCode: "97477",
  latitude: 10.01586,
  longitude: 76.34186,
  mapZoom: 15,
  workingHours: "Mon - Sat: 9:00 AM - 8:00 PM | Sunday: Emergency Only",
  doctorName: "Dr. Sankar",
  doctorTitle: "Chief Dental Surgeon & Clinic Founder",
  doctorBio:
    "Distinguished clinician with over 15 years of surgical excellence in implantology, painless endodontics, and restorative oral rehabilitation.",
  doctorPhone: "+91 98470 12345",
  ownerName: "Dr. Sankar & Associates",
  ownerTitle: "Clinic Owner & Managing Director",
  ownerBio:
    "Committed to providing world-class, patient-first clinical and dental care with cutting-edge diagnostics and sterilization protocols.",
  headerBgColor: "#f4f4f5",
  headerTextColor: "#18181b",
  headerContactBtnBgColor: "#000000",
  headerContactBtnTextColor: "#ffffff",
  logo: {
    type: "ICON",
    iconName: "Smile",
    imageUrl: "",
    monogramText: "PD",
    shape: "rounded",
    altText: "PedioDent Dental Clinic Logo",
    showClinicName: true,
    clinicDisplayName: "PedioDent",
    tagline: "Dental Clinic",
  },
  hero: DEFAULT_HERO_CONFIG,
};
