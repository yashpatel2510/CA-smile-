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
  logoHeight?: number;
  logoSize?: number;
}

export type HeroVariant = "default" | "blank1" | "blank2";

export interface HeroSectionConfig {
  // Hero Variant: "default" (Classic Doctor Cutout), "blank1" (Blank Hero 1), "blank2" (Blank Hero 2)
  heroVariant?: HeroVariant;

  // Blank Hero Customizable Fields (optional)
  blankHeroTitle?: string;
  blankHeroSubtitle?: string;
  blankHeroCtaText?: string;
  blankHeroCtaUrl?: string;
  blankHeroMinHeight?: string;
  blankHeroBgColor?: string;
  blankHeroTextColor?: string;

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
  heroVariant: "default",
  blankHeroTitle: "",
  blankHeroSubtitle: "",
  blankHeroCtaText: "",
  blankHeroCtaUrl: "/contact",
  blankHeroMinHeight: "520px",
  blankHeroBgColor: "#ffffff",
  blankHeroTextColor: "#18181b",
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
  aboutVideoUrl?: string; // YouTube or video URL for About Us page
  aboutSection?: AboutSectionConfig; // Customizable About Us Video & Page Section

  // Customizable Map & Location Section
  mapSectionBgColor?: string; // Background color for map section (default #ffffff)
  mapStyle?: "dark" | "light"; // Visual styling for map (dark road vs standard light)
  whatsappPhone?: string; // WhatsApp number or link
  instagramUrl?: string; // Instagram profile link
  googleMapsUrl?: string; // Direct link for Get Directions / Open Map
  mapExactAddress?: string; // Full address string for pin positioning and speech bubble
  mapSectionTitle?: string; // Header title (default "ADDRESS")
  mapCardTitle?: string; // Clinic name shown on speech bubble (default "CA Smile Dental Clinic")
  mapCardImage?: string; // Thumbnail image for clinic card
  mapPinPulse?: boolean; // Enable/disable pulsing halo animation
  mapPinColor?: string; // Custom pin color (default "#E53935")

  // Customizable Footer Clinic Space Polaroid Gallery
  gallery?: GallerySectionConfig;
}

export interface PolaroidPhotoItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  date?: string;
  initialRotate?: number;
  hoverRotate?: number;
  restingY?: number;
  hoverY?: number;
  zIndex?: number;
}

export interface GallerySectionConfig {
  enabled?: boolean;
  headingLine1?: string;
  headingLine2?: string;
  description?: string;
  showAddressCard?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  showMascot?: boolean;
  showCenterLogo?: boolean;
  centerLogoUrl?: string;
  centerLogoAlt?: string;
  centerLogoHeight?: number;
  centerLogoGlow?: boolean;
  backgroundColor?: string;
  textColor?: string;
  photos: PolaroidPhotoItem[];
}

export const DEFAULT_GALLERY_PHOTOS: PolaroidPhotoItem[] = [
  {
    id: "p1",
    src: "/images/ca-smile-clinic-building.jpg",
    alt: "CA Smile Dental Clinic Exterior Space",
    caption: "The Clinic Space",
    date: "Bilimora",
    initialRotate: -6,
    hoverRotate: -1,
    restingY: 56,
    hoverY: -80,
    zIndex: 11,
  },
  {
    id: "p2",
    src: "/images/why-trust-us-chair.jpg",
    alt: "Precision Treatment Suite with Illumination",
    caption: "Treatment Suite",
    date: "Operatory 01",
    initialRotate: 6,
    hoverRotate: 1,
    restingY: 50,
    hoverY: -86,
    zIndex: 12,
  },
  {
    id: "p3",
    src: "/images/treatments/digital-smile-design.jpg",
    alt: "Digital Smile Design Consultation and Diagnostics",
    caption: "Smile Design Lab",
    date: "3D Digital Scan",
    initialRotate: -5,
    hoverRotate: 0,
    restingY: 54,
    hoverY: -82,
    zIndex: 13,
  },
  {
    id: "p4",
    src: "/images/dr-deep-patel.jpg",
    alt: "Dr. Deep Patel - Chief Dental Surgeon",
    caption: "Dr. Deep Patel",
    date: "Chief Surgeon",
    initialRotate: 4,
    hoverRotate: -1,
    restingY: 48,
    hoverY: -88,
    zIndex: 14,
  },
  {
    id: "p5",
    src: "/images/hero-desktop.jpg",
    alt: "CA Smile Clinical Specialists & Team",
    caption: "Dedicated Team",
    date: "Together",
    initialRotate: -4,
    hoverRotate: 0,
    restingY: 52,
    hoverY: -84,
    zIndex: 15,
  },
  {
    id: "p6",
    src: "/images/hero-doctor-dental-care.png",
    alt: "Gentle and Painless Dental Treatment",
    caption: "Painless Dental Care",
    date: "Gentle Touch",
    initialRotate: 6,
    hoverRotate: 1,
    restingY: 46,
    hoverY: -86,
    zIndex: 16,
  },
];

export const DEFAULT_GALLERY_CONFIG: GallerySectionConfig = {
  enabled: true,
  headingLine1: "Drop by for a smile.",
  headingLine2: "At anytime.",
  description:
    "... more than that — it is what builds trust and comfort. A space where we welcome each patient with genuine warmth, deliver painless advanced care, and craft healthy, confident smiles. This sense of togetherness is born and nurtured out of our shared space, the clinic.",
  showAddressCard: true,
  addressLine1: "1st Floor, Labdhi Arcade, Above HDFC Bank",
  addressLine2: "Convent Rd, Bilimora, Gujarat 396321",
  phone: "+91 72260 98074",
  showMascot: true,
  showCenterLogo: true,
  centerLogoUrl: "/images/ca-smile-logo-white-solid.png",
  centerLogoAlt: "CA Smile Multispeciality Dental Clinic",
  centerLogoHeight: 60,
  centerLogoGlow: true,
  backgroundColor: "#0d0e12",
  textColor: "#ffffff",
  photos: DEFAULT_GALLERY_PHOTOS,
};

export interface AboutSectionConfig {
  videoUrl?: string; // YouTube or MP4 video URL
  videoTitle?: string; // Main heading in About Us video section
  videoSubtitle?: string; // Small badge/tag above heading
  badgeText?: string; // Live status caption
  autoplayOnScroll?: boolean; // Autoplays when scrolled into view
  videoSize?: "max-w-4xl" | "max-w-5xl" | "max-w-6xl" | "max-w-full"; // Container size
  defaultQuality?: "hd1080" | "hd720" | "medium" | "auto"; // Playback quality
  hideYouTubeBranding?: boolean; // Crop/shield YouTube channel avatar & watermark
  startMuted?: boolean; // Start video muted (required for browser autoplay)
  showStatusPill?: boolean; // Show playing/paused pill
}

export const DEFAULT_ABOUT_CONFIG: AboutSectionConfig = {
  videoUrl: "https://www.youtube.com/watch?v=mbBugyspbPE",
  videoTitle: "Take a Look Inside Our Clinic",
  videoSubtitle: "Clinic Tour & Experience",
  badgeText: "Autoplays on scroll • Interactive play & pause",
  autoplayOnScroll: true,
  videoSize: "max-w-4xl",
  defaultQuality: "hd1080",
  hideYouTubeBranding: true,
  startMuted: true,
  showStatusPill: true,
};

export const DEFAULT_CLINIC_BRANDING: ClinicBrandConfig = {
  themeKey: "teal-serenity",
  clinicName: "PedioDent",
  slug: "pediodent-main",
  aboutVideoUrl: "https://www.youtube.com/watch?v=mbBugyspbPE",
  aboutSection: DEFAULT_ABOUT_CONFIG,
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
  mapSectionBgColor: "#ffffff",
  mapStyle: "dark",
  whatsappPhone: "+91 72260 98074",
  instagramUrl: "https://instagram.com",
  googleMapsUrl:
    "https://www.google.com/maps/place/CA+Smile+Multispeciality+Dental+Clinic/data=!4m2!3m1!1s0x0:0x3a288255f324c8de?sa=X&ved=1t:2428&ictx=111",
  mapExactAddress:
    "1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank/ Krishna Dairy, Kutchhi Friends Society, Bilimora, Gujarat 396321",
  mapSectionTitle: "ADDRESS",
  mapCardTitle: "CA Smile Dental Clinic",
  mapCardImage: "/images/ca-smile-clinic-building.jpg",
  mapPinPulse: true,
  mapPinColor: "#E53935",
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
    logoHeight: 36,
    logoSize: 36,
  },
  hero: DEFAULT_HERO_CONFIG,
  gallery: DEFAULT_GALLERY_CONFIG,
};
