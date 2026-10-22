"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Calendar,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Activity,
  X,
  LayoutGrid,
  ListFilter,
  ArrowRight,
  ArrowUpRight,
  HelpCircle,
  Check,
} from "lucide-react";

export interface ShowcaseItem {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  category?: string;
  image: string;
  whatItIs?: string;
  howItWorks?: string;
  benefits?: string;
  procedure?: string[];
  result?: string;
  whatIfNotDone?: string;
  paragraphs: string[];
  isActive?: boolean;
  order?: number;
  type?: "treatment" | "diagnostic";
}

export const DIAGNOSTIC_ITEMS: ShowcaseItem[] = [
  {
    id: "radiological-examination",
    title: "Radiological Examination",
    subtitle: "Ultra-Low Dose Digital Panoramic X-Rays",
    category: "Digital Imaging",
    type: "diagnostic",
    image: "/images/treatments/radiological-examination.jpg",
    whatItIs: "A comprehensive digital scan capturing full panoramic and cephalometric images of your mouth, jawbone, roots, and nerve canals in seconds.",
    howItWorks: "The scanner rotates smoothly around your head while you stand comfortably. Low-dose digital sensors immediately render high-resolution views.",
    benefits: "Provides complete 360° structural insights with 90% less radiation than legacy film X-rays, enabling precise treatment planning.",
    procedure: [
      "Positioning comfortably with gentle chin support.",
      "Smooth 12-second panoramic rotation.",
      "Instant crystal-clear image generation on screen.",
      "Physician review and personalized consultation."
    ],
    result: "Immediate full-mouth anatomical roadmap identifying hidden bone conditions, impactions, and root health.",
    whatIfNotDone: "Deep-seated bone loss, cystic lesions, or nerve proximity can remain invisible until severe dental emergencies occur.",
    paragraphs: [
      "High-precision panoramic and cephalometric digital radiology delivering complete structural insights into tooth roots, bone density, and anatomical canals.",
      "Our ultra-low dose diagnostic units minimize radiation exposure by up to 90% while providing immediate high-resolution digital clarity for accurate clinical evaluation."
    ],
  },
  {
    id: "periodontal-examination",
    title: "Periodontal Examination",
    subtitle: "Detailed Gum & Bone Support Evaluation",
    category: "Clinical Diagnostics",
    type: "diagnostic",
    image: "/images/treatments/periodontal-examination.jpg",
    whatItIs: "A gentle clinical check of your gum foundation using calibrated micro-probes to measure pocket depths and spot early inflammation.",
    howItWorks: "The periodontist measures pocket depth around each tooth with millimeter accuracy to evaluate tissue attachment and bone stability.",
    benefits: "Identifies early gingivitis and periodontitis before bone deterioration occurs, preserving the natural support of your teeth.",
    procedure: [
      "Gentle micro-probe depth mapping around each tooth.",
      "Tissue firmness and bleeding index evaluation.",
      "Bacterial plaque biofilm assessment.",
      "Customized preventative therapy plan."
    ],
    result: "Complete periodontal health profile that protects against gum recession and loose teeth.",
    whatIfNotDone: "Silent, painless gum disease gradually destroys underlying jawbone, leading to premature tooth loosening and extraction.",
    paragraphs: [
      "Detailed clinical assessment of gum tissues, measuring periodontal pocket depths with calibrated titanium micro-probes to identify micro-inflammation before bone recession begins.",
      "Essential for safeguarding the foundational biological support of your teeth and planning individualized preventative or regenerative therapy."
    ],
  },
  {
    id: "tooth-sensitivity-test",
    title: "Tooth Sensitivity Test",
    subtitle: "Nerve Vitality & Micro-Fracture Diagnostics",
    category: "Pulp Vitality",
    type: "diagnostic",
    image: "/images/treatments/tooth-sensitivity.jpg",
    whatItIs: "A fast, non-invasive assessment to determine whether tooth pain stems from superficial enamel erosion or internal nerve inflammation.",
    howItWorks: "Calibrated temperature and electrical impulses evaluate sensory responses to precisely map nerve health and detect microscopic hairline cracks.",
    benefits: "Instantly clarifies whether gentle mineral desensitization bonding is sufficient or if targeted endodontic care is necessary.",
    procedure: [
      "Visual inspection of tooth enamel surfaces.",
      "Thermal and electrical pulp response test.",
      "Bite-stress test to rule out hairline fractures.",
      "Clear explanation of conservative treatment choices."
    ],
    result: "Accurate clarity on tooth nerve viability, avoiding unnecessary root canals or prolonged discomfort.",
    whatIfNotDone: "Unaddressed pulp inflammation can progress into deep root abscesses, excruciating throbbing pain, and permanent tooth damage.",
    paragraphs: [
      "Precise thermal and electrical pulp vitality diagnostics used to evaluate sensory response, detect micro-fractures, and pinpoint concealed nerve inflammation.",
      "Provides immediate clarity to determine whether gentle remineralization, bonding, or targeted endodontic care is required."
    ],
  },
  {
    id: "digital-radiography",
    title: "Digital Radiography",
    subtitle: "Chairside High-Resolution Intraoral Sensors",
    category: "Intraoral X-Ray",
    type: "diagnostic",
    image: "/images/treatments/digital-radiography.jpg",
    whatItIs: "Next-generation intraoral digital sensors that take instant, high-magnification radiographs of individual teeth right by your dental chair.",
    howItWorks: "A miniature rounded sensor rests gently beside the target tooth, immediately capturing high-definition radiographs directly onto the display.",
    benefits: "No waiting for film chemicals, instant magnification to detect micro-decay between tight teeth, and 90% lower radiation.",
    procedure: [
      "Placing a comfortable cushioned sensor inside mouth.",
      "Instant 1-second exposure.",
      "Magnified review on high-definition chairside monitor.",
      "Doctor explains findings in plain language."
    ],
    result: "Pinpoint detection of early interdental cavities, defective margins, and bone levels.",
    whatIfNotDone: "Hidden cavities between teeth cannot be seen visually and will continue expanding silently into the inner tooth nerve.",
    paragraphs: [
      "Next-generation chairside digital intraoral sensors transmitting instant crystal-clear radiographs directly to high-definition screens.",
      "Enables instant diagnosis during consultation with unmatched diagnostic precision and minimal patient wait time."
    ],
  },
  {
    id: "computed-tomography",
    title: "Computed Tomography (3D CBCT)",
    subtitle: "3D Cone Beam Volumetric Imaging",
    category: "3D CBCT Scans",
    type: "diagnostic",
    image: "/images/treatments/computed-tomography.jpg",
    whatItIs: "Advanced 3D CBCT dental imaging producing millimeter-accurate three-dimensional digital models of teeth, jaw bones, sinuses, and nerves.",
    howItWorks: "An open rotating scanner captures volumetric slices in under 15 seconds, assembling a full interactive 3D anatomical model.",
    benefits: "Guarantees 100% predictable implant placement, safe wisdom tooth surgeries, and micro-endodontic root canal treatments.",
    procedure: [
      "Standing or sitting comfortably in an open, non-claustrophobic unit.",
      "Quick 15-second 3D rotation.",
      "Computerized volumetric 3D reconstruction.",
      "Interactive virtual treatment simulation with surgeon."
    ],
    result: "Complete 3D anatomical visualization ensuring treatments are safe, minimally invasive, and painless.",
    whatIfNotDone: "Performing surgical implants or extractions without 3D planning risks nerve injury, sinus perforation, and unpredictable outcomes.",
    paragraphs: [
      "Computed tomography is a fast, painless, and precise procedure that creates a 3D image of the teeth, jaw, and tissues.",
      "It helps assess bone structures, detect hidden pathologies, and plan treatment with accuracy. With minimal radiation, it is safe even for frequent use."
    ],
  },
  {
    id: "occlusal-analysis",
    title: "Occlusal Analysis",
    subtitle: "Computerized Digital Bite Force Dynamics",
    category: "Bite & TMJ",
    type: "diagnostic",
    image: "/images/treatments/occlusal-analysis.jpg",
    whatItIs: "A digital computerized analysis measuring how your upper and lower teeth contact during chewing, biting, and resting.",
    howItWorks: "You bite down on an ultra-thin digital pressure sensor wand that maps bite forces and micro-second contact timing in color-coded 2D and 3D.",
    benefits: "Identifies destructive bite imbalances, relieves chronic TMJ jaw pain and headaches, and ensures long-lasting veneers and implants.",
    procedure: [
      "Placing the thin digital sensor between your teeth.",
      "Performing natural chewing and tapping motions.",
      "Real-time digital mapping of excessive bite pressure.",
      "Micro-equilibration to evenly balance bite forces."
    ],
    result: "A harmonious, strain-free bite that relieves jaw joint stress and protects restorations from fracture.",
    whatIfNotDone: "Unbalanced bite forces cause cracked teeth, broken crowns, worn enamel, and chronic jaw clenching pain.",
    paragraphs: [
      "Digital computerized evaluation of bite forces, tooth contact dynamics, and jaw joint movement using high-precision sensor wands.",
      "Identifies destructive chewing imbalances, relieves TMJ strain, and guarantees the lasting stability of veneers, crowns, and implants."
    ],
  },
  {
    id: "fluorescence-diagnostics",
    title: "Fluorescence Diagnostics",
    subtitle: "Laser Optical Enamel Caries Detection",
    category: "Caries Detection",
    type: "diagnostic",
    image: "/images/treatments/fluorescence-diagnostics.jpg",
    whatItIs: "A completely pain-free optical laser device that scans tooth enamel to detect early demineralization long before a cavity hole forms.",
    howItWorks: "Different wavelengths of light illuminate enamel surfaces, causing bacterial decay to fluoresce and alerting the clinician to sub-surface spots.",
    benefits: "Allows micro-preventative fluoride remineralization treatments that can heal teeth and prevent the need for drilling or fillings.",
    procedure: [
      "Painless optical light wand swept over tooth grooves.",
      "Instant digital numeric readout of enamel density.",
      "Identification of early demineralization areas.",
      "Application of preventive remineralization varnish."
    ],
    result: "Earliest possible discovery of decay, preserving 100% of your natural healthy tooth structure.",
    whatIfNotDone: "Undetected micro-decay expands silently beneath enamel, eventually turning into deep cavities requiring restorative fillings.",
    paragraphs: [
      "Optical fluorescence wavelength diagnostics illuminating dental enamel to expose hidden subsurface caries and early demineralization.",
      "Allows for biological tooth preservation and non-invasive micro-interventions long before traditional drilling would be required."
    ],
  },
  {
    id: "bacteriological-analysis",
    title: "Bacteriological Analysis",
    subtitle: "Oral Microbiome & Pathogen Biofilm Profiling",
    category: "Microbiology",
    type: "diagnostic",
    image: "/images/treatments/digital-radiography.jpg",
    whatItIs: "A specialized laboratory test analyzing the bacterial strains present in your saliva and gum pockets to pinpoint aggressive periodontal pathogens.",
    howItWorks: "A gentle paper point sample is collected from the gumline and processed with molecular DNA profiling to identify specific bacteria.",
    benefits: "Enables targeted, biocompatible antiseptic therapies tailored to your specific oral microbiome rather than guesswork.",
    procedure: [
      "Painless collection of sample with sterile paper point.",
      "Molecular DNA testing for periodontal pathogens.",
      "Detailed laboratory report on bacterial strain resistance.",
      "Targeted clinical therapy prescribed for permanent control."
    ],
    result: "Long-term control of harmful bacteria, safeguarding natural teeth and dental implant integration.",
    whatIfNotDone: "Persistent aggressive bacterial colonies remain untreated, causing recurrent gum infections and potential implant failure.",
    paragraphs: [
      "Specialized laboratory testing of the oral microbiome to detect specific anaerobic periodontal pathogens and establish biological susceptibility profiles.",
      "Guides targeted, biocompatible antibacterial treatments to eliminate persistent infection and safeguard long-term implant integration."
    ],
  },
];

export const TREATMENT_ITEMS: ShowcaseItem[] = [
  {
    id: "digital-smile-design",
    title: "Digital Smile Design",
    subtitle: "Computer Smile Planning",
    category: "Aesthetic Dentistry",
    type: "treatment",
    image: "/images/treatments/digital-smile-design.jpg",
    whatItIs: "A modern computerized method that uses computer photos and scans to show you how your new smile will look before any treatment begins.",
    howItWorks: "Advanced imaging software maps your face and tooth shape to create a virtual 3D preview of your final smile.",
    benefits: "Gives you total clarity and lets you preview your results beforehand so you feel confident.",
    procedure: [
      "Taking initial photographs and digital scans.",
      "Processing images through specialized software.",
      "Reviewing the 3D computer simulation together.",
      "Using the finalized plan to guide treatment."
    ],
    result: "A predictable, beautifully balanced smile that matches your face.",
    whatIfNotDone: "You might undergo cosmetic dental treatments without knowing how the final outcome will look.",
    paragraphs: [
      "A modern computerized method that uses computer photos and scans to show you how your new smile will look before any treatment begins.",
      "Advanced imaging software maps your face and tooth shape to create a virtual 3D preview of your final smile."
    ],
  },
  {
    id: "dental-implants",
    title: "Dental Implants",
    subtitle: "Permanent Artificial Teeth",
    category: "Implantology",
    type: "treatment",
    image: "/images/treatments/dental-implants.jpg",
    whatItIs: "The best way to replace missing teeth by placing a strong titanium post into the jawbone as a permanent artificial root.",
    howItWorks: "The titanium root bonds naturally with your jawbone over time, providing a sturdy foundation that looks and chews like a real tooth.",
    benefits: "Stops your jawbone from getting weak, restores full chewing power, and protects neighboring healthy teeth.",
    procedure: [
      "Initial examination and X-rays.",
      "Minor surgical placement of the titanium post.",
      "Healing period for bone fusion.",
      "Attaching a custom crown matching natural color."
    ],
    result: "A permanent, strong, and natural-looking tooth replacement.",
    whatIfNotDone: "Leaving gaps can cause surrounding teeth to drift, bone to weaken, and difficulty chewing.",
    paragraphs: [
      "The best way to replace missing teeth by placing a strong titanium post into the jawbone as a permanent artificial root.",
      "The titanium root bonds naturally with your jawbone over time, providing a sturdy foundation that looks and chews like a real tooth."
    ],
  },
  {
    id: "full-mouth-rehabilitation",
    title: "Full Mouth Rehabilitation",
    subtitle: "Complete Smile Makeover",
    category: "Restorative Dentistry",
    type: "treatment",
    image: "/images/treatments/full-mouth-rehab.jpg",
    whatItIs: "A complete treatment plan to repair and rebuild all your upper and lower teeth together.",
    howItWorks: "Combines restorative treatments to fix severe tooth wear, broken teeth, bite problems, or constant jaw pain.",
    benefits: "Restores full mouth health, improves chewing, and gives you back a healthy mouth step by step.",
    procedure: [
      "Diagnostic evaluation of bite and teeth.",
      "Creating a customized master plan.",
      "Foundation work like root canals or fillings.",
      "Placing crowns, bridges, or implants."
    ],
    result: "A fully restored, functional, and healthy mouth with a radiant smile.",
    whatIfNotDone: "Widespread decay, broken teeth, and bad bites will worsen, leading to constant pain and tooth loss.",
    paragraphs: [
      "A complete treatment plan to repair and rebuild all your upper and lower teeth together.",
      "Combines restorative treatments to fix severe tooth wear, broken teeth, bite problems, or constant jaw pain."
    ],
  },
  {
    id: "dental-crowns-and-bridges",
    title: "Dental Crowns & Bridges",
    subtitle: "Caps and Fixed Teeth",
    category: "Prosthodontics",
    type: "treatment",
    image: "/images/treatments/dental-crowns.jpg",
    whatItIs: "Strong protective covers (crowns) for weak or broken teeth, and artificial teeth (bridges) used to fill empty spaces.",
    howItWorks: "Crowns fit securely over a weak tooth like a helmet to protect it, while bridges use artificial teeth to span across empty gaps.",
    benefits: "Crowns save weak teeth from breaking, while bridges fill gaps so you can smile and chew without worry.",
    procedure: [
      "Shaping and cleaning the tooth/anchor teeth.",
      "Taking precise impressions.",
      "Creating a custom crown or bridge.",
      "Cementing the restoration permanently."
    ],
    result: "A durable, tooth-colored cover or bridge that blends seamlessly.",
    whatIfNotDone: "A weak tooth can fracture completely, and gaps can cause neighboring teeth to shift.",
    paragraphs: [
      "Strong protective covers (crowns) for weak or broken teeth, and artificial teeth (bridges) used to fill empty spaces.",
      "Crowns fit securely over a weak tooth like a helmet to protect it, while bridges use artificial teeth to span across empty gaps."
    ],
  },
  {
    id: "root-canal-treatment",
    title: "Root Canal Treatment",
    subtitle: "Nerve Treatment to Save the Tooth",
    category: "Endodontics",
    type: "treatment",
    image: "/images/treatments/root-canal.jpg",
    whatItIs: "A procedure to clean out a badly infected or aching tooth instead of pulling it out.",
    howItWorks: "The infected, painful nerve tissue inside the root is safely removed, and the inner space is cleaned and sealed.",
    benefits: "Takes away your toothache, stops infection from spreading, and lets you keep your natural tooth.",
    procedure: [
      "Numbing the area.",
      "Creating a small opening to access the nerve.",
      "Cleaning and disinfecting canals.",
      "Sealing roots and placing a protective crown."
    ],
    result: "A healthy, pain-free tooth that functions normally without discomfort.",
    whatIfNotDone: "Infection will spread deeper into the bone, causing severe swelling, excruciating pain, and tooth extraction.",
    paragraphs: [
      "A procedure to clean out a badly infected or aching tooth instead of pulling it out.",
      "The infected, painful nerve tissue inside the root is safely removed, and the inner space is cleaned and sealed."
    ],
  },
  {
    id: "wisdom-tooth-removal",
    title: "Wisdom Tooth Removal",
    subtitle: "Painful Back Tooth Surgery",
    category: "Oral Surgery",
    type: "treatment",
    image: "/images/treatments/wisdom-tooth.jpg",
    whatItIs: "A safe minor surgery to take out back molar teeth that are stuck, causing pain, or crowding other teeth.",
    howItWorks: "Using local anesthesia, the dentist gently loosens and removes the troublesome wisdom tooth to relieve pressure.",
    benefits: "Stops severe pain, prevents gum infections, and keeps your other teeth straight.",
    procedure: [
      "Checking root position with X-ray.",
      "Numbing the area.",
      "Removing the tooth from its socket.",
      "Placing a small stitch and giving care advice."
    ],
    result: "Permanent relief from deep jaw pressure, pain, and recurring swelling.",
    whatIfNotDone: "Impacted wisdom teeth can cause severe crowding of front teeth, cysts, and painful gum infections.",
    paragraphs: [
      "A safe minor surgery to take out back molar teeth that are stuck, causing pain, or crowding other teeth.",
      "Using local anesthesia, the dentist gently loosens and removes the troublesome wisdom tooth to relieve pressure."
    ],
  },
  {
    id: "gum-treatment",
    title: "Gum Treatment",
    subtitle: "Care for Bleeding and Weak Gums",
    category: "Periodontics",
    type: "treatment",
    image: "/images/treatments/gum-treatment.jpg",
    whatItIs: "Special care to clean and heal your gums when they bleed, swell, or feel sore.",
    howItWorks: "Involves deep cleanings below the gumline to remove hardened tartar and bacteria that cause inflammation.",
    benefits: "Stops your gums from bleeding, removes bad breath, and keeps your teeth firmly anchored.",
    procedure: [
      "Evaluating gum health.",
      "Professional scaling to clean plaque/tartar.",
      "Smoothing root surfaces below gumline.",
      "Recommending home brushing techniques."
    ],
    result: "Pink, firm, healthy gums that do not bleed when brushing.",
    whatIfNotDone: "Untreated gum disease destroys the jawbone holding your teeth, leading to loose teeth and tooth loss.",
    paragraphs: [
      "Special care to clean and heal your gums when they bleed, swell, or feel sore.",
      "Involves deep cleanings below the gumline to remove hardened tartar and bacteria that cause inflammation."
    ],
  },
  {
    id: "porcelain-veneers",
    title: "Porcelain Veneers",
    subtitle: "Thin Custom Ceramic Shells",
    category: "Aesthetic Dentistry",
    type: "treatment",
    image: "/images/treatments/porcelain-veneers.jpg",
    whatItIs: "Ultra-thin, custom-made ceramic shells bonded to the front of teeth to correct color, gaps, and chips.",
    howItWorks: "Minimally prepped enamel is bonded with high-grade dental porcelain crafted to mimic natural enamel translucency.",
    benefits: "Creates a red-carpet smile that resists coffee and tea stains permanently while feeling like natural teeth.",
    procedure: [
      "Aesthetic design and shade matching.",
      "Gentle micro-preparation of front surfaces.",
      "Precision digital 3D scans.",
      "Permanent adhesive bonding of porcelain veneers."
    ],
    result: "A dazzling, flawless, and stain-resistant Hollywood-grade smile.",
    whatIfNotDone: "Severely discolored, chipped, or gapped teeth continue affecting your self-esteem and smiling confidence.",
    paragraphs: [
      "Ultra-thin, custom-made ceramic shells bonded to the front of teeth to correct color, gaps, and chips.",
      "Minimally prepped enamel is bonded with high-grade dental porcelain crafted to mimic natural enamel translucency."
    ],
  },
  {
    id: "teeth-whitening",
    title: "Teeth Whitening",
    subtitle: "Laser Clinical Brightening",
    category: "Cosmetic",
    type: "treatment",
    image: "/images/treatments/teeth-whitening.jpg",
    whatItIs: "A safe, professional in-office bleaching treatment that lightens teeth by up to 8 shades in a single 45-minute visit.",
    howItWorks: "Medical-grade hydrogen peroxide gel is activated with a gentle LED laser light to break down deep enamel stains.",
    benefits: "Instantly removes years of coffee, tea, and smoke stains without damaging or thinning your tooth enamel.",
    procedure: [
      "Gum barrier applied for total protection.",
      "Clinical whitening gel evenly coated on teeth.",
      "Three 15-minute LED light activation cycles.",
      "Fluoride desensitizing finish."
    ],
    result: "A noticeably brighter, radiant smile up to 8 shades lighter in one appointment.",
    whatIfNotDone: "Surface stains continue penetrating deeper into dentin, making home toothpastes completely ineffective.",
    paragraphs: [
      "A safe, professional in-office bleaching treatment that lightens teeth by up to 8 shades in a single 45-minute visit.",
      "Medical-grade hydrogen peroxide gel is activated with a gentle LED laser light to break down deep enamel stains."
    ],
  },
  {
    id: "orthodontics",
    title: "Orthodontics & Clear Aligners",
    subtitle: "Invisible Teeth Straightening",
    category: "Orthodontics",
    type: "treatment",
    image: "/images/treatments/orthodontics.jpg",
    whatItIs: "Modern teeth alignment using nearly invisible, custom transparent aligners or aesthetic ceramic braces.",
    howItWorks: "A series of computer-designed clear aligners gently moves your teeth millimeter by millimeter into ideal alignment.",
    benefits: "Straightens crooked teeth discreetly without wire cuts, food restrictions, or metal bracket visibility.",
    procedure: [
      "3D digital intraoral scan of bite and teeth.",
      "Digital treatment simulation showing final alignment.",
      "Custom clear aligner trays delivered.",
      "Routine check-ins every 6 to 8 weeks."
    ],
    result: "Perfect dental arch alignment, effortless cleaning, and a balanced bite profile.",
    whatIfNotDone: "Crowded and overlapping teeth trap food debris, causing recurring decay, gum pockets, and jaw joint strain.",
    paragraphs: [
      "Modern teeth alignment using nearly invisible, custom transparent aligners or aesthetic ceramic braces.",
      "A series of computer-designed clear aligners gently moves your teeth millimeter by millimeter into ideal alignment."
    ],
  },
  {
    id: "tooth-fillings",
    title: "Tooth Fillings",
    subtitle: "Tooth-Colored Composite Fillings",
    category: "Restorative Dentistry",
    type: "treatment",
    image: "/images/treatments/tooth-fillings.jpg",
    whatItIs: "Seamless composite resin restorations that repair cavities and minor fractures, matching your natural tooth shade.",
    howItWorks: "Decay is gently removed and the cavity is layered with biocompatible nano-hybrid resin cured with blue light.",
    benefits: "Completely invisible, mercury-free, bonds tightly to tooth structure, and restores full chewing ability immediately.",
    procedure: [
      "Painless local numbing if required.",
      "Careful removal of cavity decay.",
      "Color-matched composite resin layering.",
      "Curing with LED light and bite polish."
    ],
    result: "A strong, smooth, and aesthetically unnoticeable restoration that looks just like your natural tooth.",
    whatIfNotDone: "Cavities never heal on their own; decay will burrow deeper into the nerve chamber, causing excruciating pain.",
    paragraphs: [
      "Seamless composite resin restorations that repair cavities and minor fractures, matching your natural tooth shade.",
      "Decay is gently removed and the cavity is layered with biocompatible nano-hybrid resin cured with blue light."
    ],
  },
  {
    id: "children-dentistry",
    title: "Children's Dentistry",
    subtitle: "Gentle Pediatric Dental Care",
    category: "Pediatric Dentistry",
    type: "treatment",
    image: "/images/treatments/children-dentistry.jpg",
    whatItIs: "Compassionate, playful dental checkups and preventive fluoride/sealant treatments designed specifically for kids and toddlers.",
    howItWorks: "Uses the gentle 'Tell-Show-Do' technique to create positive, tear-free dental experiences that eliminate fear.",
    benefits: "Protects milk teeth from early decay, guides proper adult tooth eruption, and instills lifelong healthy brushing habits.",
    procedure: [
      "Friendly, unhurried chairside introduction.",
      "Gentle tooth counting and plaque check.",
      "Protective fluoride varnish application.",
      "Fun prize reward and parent advice."
    ],
    result: "A confident child with healthy cavity-free teeth who loves visiting the dentist.",
    whatIfNotDone: "Early childhood cavities cause painful infections, eating difficulties, and premature tooth loss that misaligns adult teeth.",
    paragraphs: [
      "Compassionate, playful dental checkups and preventive fluoride/sealant treatments designed specifically for kids and toddlers.",
      "Uses the gentle 'Tell-Show-Do' technique to create positive, tear-free dental experiences that eliminate fear."
    ],
  },
  {
    id: "dentures",
    title: "Dentures",
    subtitle: "Removable Artificial Teeth",
    category: "Prosthodontics",
    type: "treatment",
    image: "/images/treatments/dentures.jpg",
    whatItIs: "Custom-fitted complete or partial removable appliances that replace multiple missing teeth and support facial cheeks.",
    howItWorks: "Individually sculpted acrylic and composite teeth rest securely over your gums, restoring eating and speaking with ease.",
    benefits: "Affordable, non-surgical tooth replacement that prevents facial sagging, restores speech clarity, and allows comfortable chewing.",
    procedure: [
      "Accurate jaw measurements and impressions.",
      "Trial wax fitting to verify bite and aesthetics.",
      "Final custom denture fabrication.",
      "Comfort adjustment and care consultation."
    ],
    result: "A comfortable, natural-looking complete smile that restores facial fullness and dining enjoyment.",
    whatIfNotDone: "Multiple missing teeth collapse facial height, cause sunken cheeks, and prevent proper digestion of solid foods.",
    paragraphs: [
      "Custom-fitted complete or partial removable appliances that replace multiple missing teeth and support facial cheeks.",
      "Individually sculpted acrylic and composite teeth rest securely over your gums, restoring eating and speaking with ease."
    ],
  },
];

interface WhiteDentalTreatmentShowcaseProps {
  mode?: "both" | "diagnostic" | "treatment";
  initialTreatments?: ShowcaseItem[];
  initialDiagnostics?: ShowcaseItem[];
  initialShowDiagnostics?: boolean;
  initialShowTreatments?: boolean;
  initialSettings?: {
    showDiagnostics?: boolean;
    showTreatments?: boolean;
    treatmentHeading?: string;
    treatmentSubtitle?: string;
    diagnosticHeading?: string;
    diagnosticSubtitle?: string;
  };
  allOpen?: boolean;
}

export function WhiteDentalTreatmentShowcase({
  mode = "both",
  initialTreatments,
  initialDiagnostics,
  initialShowDiagnostics = true,
  initialShowTreatments = true,
  initialSettings,
  allOpen = false,
}: WhiteDentalTreatmentShowcaseProps) {
  // Master lists
  const [treatments, setTreatments] = useState<ShowcaseItem[]>(
    initialTreatments || TREATMENT_ITEMS
  );
  const [diagnostics, setDiagnostics] = useState<ShowcaseItem[]>(
    initialDiagnostics || DIAGNOSTIC_ITEMS
  );

  // Settings
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(
    initialShowDiagnostics !== undefined
      ? initialShowDiagnostics
      : initialSettings?.showDiagnostics !== false
  );
  const [showTreatments, setShowTreatments] = useState<boolean>(
    initialShowTreatments !== undefined
      ? initialShowTreatments
      : initialSettings?.showTreatments !== false
  );

  // Active Tab: "all" | "treatments" | "diagnostics"
  const [activeTab, setActiveTab] = useState<"all" | "treatments" | "diagnostics">(
    mode === "diagnostic" ? "diagnostics" : mode === "treatment" ? "treatments" : "all"
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

  // Expanded items for deep reading
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (allOpen) {
      return new Set([
        ...TREATMENT_ITEMS.map((t) => t.id),
        ...DIAGNOSTIC_ITEMS.map((d) => d.id),
      ]);
    }
    // Default open the first treatment card for immediate reading
    return new Set(["digital-smile-design"]);
  });

  // Sync with live admin settings & data
  useEffect(() => {
    let isMounted = true;
    async function loadLiveTreatments() {
      try {
        const res = await fetch("/api/admin/treatments");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.settings) {
              if (typeof data.settings.showDiagnostics === "boolean") {
                setShowDiagnostics(data.settings.showDiagnostics);
              }
              if (typeof data.settings.showTreatments === "boolean") {
                setShowTreatments(data.settings.showTreatments);
              }
            }
            if (Array.isArray(data.treatments) && data.treatments.length > 0) {
              setTreatments(
                data.treatments
                  .filter((t: any) => t.isActive !== false)
                  .map((t: any) => ({ ...t, type: "treatment" as const }))
              );
            }
            if (Array.isArray(data.diagnostics) && data.diagnostics.length > 0) {
              setDiagnostics(
                data.diagnostics
                  .filter((d: any) => d.isActive !== false)
                  .map((d: any) => ({ ...d, type: "diagnostic" as const }))
              );
            }
          }
        }
      } catch {
        // Fallback to static initial items
      }
    }
    loadLiveTreatments();
    return () => {
      isMounted = false;
    };
  }, []);

  // Tag treatments and diagnostics with explicit type
  const allItems: ShowcaseItem[] = useMemo(() => {
    const list: ShowcaseItem[] = [];
    if (showTreatments) {
      list.push(...treatments.map((t) => ({ ...t, type: "treatment" as const })));
    }
    if (showDiagnostics) {
      list.push(...diagnostics.map((d) => ({ ...d, type: "diagnostic" as const })));
    }
    return list;
  }, [treatments, diagnostics, showTreatments, showDiagnostics]);

  // Extract unique categories for filtering
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allItems.forEach((it) => {
      if (it.category) cats.add(it.category);
    });
    return Array.from(cats);
  }, [allItems]);

  // Filter items based on activeTab, searchQuery, and selectedCategory
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // 1. Tab filter
      if (activeTab === "treatments" && item.type !== "treatment") return false;
      if (activeTab === "diagnostics" && item.type !== "diagnostic") return false;

      // 2. Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSub = item.subtitle?.toLowerCase().includes(q) || false;
        const inCat = item.category?.toLowerCase().includes(q) || false;
        const inWhat = item.whatItIs?.toLowerCase().includes(q) || false;
        const inHow = item.howItWorks?.toLowerCase().includes(q) || false;
        const inBenefits = item.benefits?.toLowerCase().includes(q) || false;
        const inPara = item.paragraphs.some((p) => p.toLowerCase().includes(q));
        if (!inTitle && !inSub && !inCat && !inWhat && !inHow && !inBenefits && !inPara) {
          return false;
        }
      }
      return true;
    });
  }, [allItems, activeTab, selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredItems.map((i) => i.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <section
      id="services-showcase"
      className="relative w-full bg-gradient-to-b from-white via-zinc-50/60 to-white text-zinc-900 font-sans py-16 sm:py-24 lg:py-28 overflow-hidden"
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-gradient-to-r from-teal-100/40 via-sky-100/30 to-indigo-100/40 blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* =====================================================================
            1. SECTION HERO & CLINICAL OVERVIEW (All in ONE Section)
           ===================================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-10 border-b border-zinc-200">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-3.5 py-1 text-xs font-semibold text-teal-800 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
              <span>Full Clinical Directory • Treatments &amp; Diagnostics in One Place</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 font-sans leading-tight">
              Dental Treatments &amp; Precision Diagnostics
            </h2>

            <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed">
              Every procedure is designed for comfort, total predictability, and gentle biological care.
              Browse our complete catalog of restorative treatments and high-definition 3D diagnostics below.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 shrink-0">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 text-left shadow-2xs">
              <div className="text-2xl font-bold text-zinc-950 font-sans">
                {treatments.length}
              </div>
              <div className="text-xs font-medium text-zinc-500 mt-0.5">Specialized Treatments</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 text-left shadow-2xs">
              <div className="text-2xl font-bold text-zinc-950 font-sans">
                {diagnostics.length}
              </div>
              <div className="text-xs font-medium text-zinc-500 mt-0.5">3D Diagnostics</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 text-left shadow-2xs">
              <div className="text-2xl font-bold text-teal-700 font-sans">100%</div>
              <div className="text-xs font-medium text-zinc-500 mt-0.5">Painless Protocol</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 text-left shadow-2xs">
              <div className="text-2xl font-bold text-indigo-700 font-sans">0 min</div>
              <div className="text-xs font-medium text-zinc-500 mt-0.5">Instant Digital Scans</div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            2. UNIFIED CONTROLS: TABS, SEARCH, CATEGORY CHIPS & VIEW SWITCHER
           ===================================================================== */}
        <div className="mt-8 space-y-6">
          {/* Main Mode Segmented Control Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="inline-flex rounded-2xl bg-zinc-100/90 p-1.5 border border-zinc-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all");
                  setSelectedCategory("all");
                }}
                className={`flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  activeTab === "all"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                <span>All Care &amp; Scans</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === "all" ? "bg-zinc-100 text-zinc-900" : "bg-zinc-200 text-zinc-600"
                }`}>
                  {allItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("treatments");
                  setSelectedCategory("all");
                }}
                className={`flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  activeTab === "treatments"
                    ? "bg-white text-teal-900 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                <span>🦷 Treatments</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === "treatments" ? "bg-teal-50 text-teal-800" : "bg-zinc-200 text-zinc-600"
                }`}>
                  {treatments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("diagnostics");
                  setSelectedCategory("all");
                }}
                className={`flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  activeTab === "diagnostics"
                    ? "bg-white text-indigo-900 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                <span>🔬 3D Diagnostics</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === "diagnostics" ? "bg-indigo-50 text-indigo-800" : "bg-zinc-200 text-zinc-600"
                }`}>
                  {diagnostics.length}
                </span>
              </button>
            </div>

            {/* View Mode & Expand All controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "grid" ? "timeline" : "grid")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:text-black transition-colors shadow-2xs"
                title="Toggle between grid cards and full detailed timeline"
              >
                {viewMode === "grid" ? (
                  <>
                    <ListFilter className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Timeline View</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Card Grid</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={expandedIds.size === filteredItems.length ? collapseAll : expandAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:text-black transition-colors shadow-2xs"
              >
                {expandedIds.size === filteredItems.length ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Read All Details</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar & Instant Filter */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by procedure name, symptom, or benefit (e.g. Root Canal, Implants, 3D CT, Whitening, Wisdom Tooth)..."
              className="w-full rounded-2xl border border-zinc-200 bg-white pl-12 pr-10 py-3.5 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 shadow-2xs transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-700"
                aria-label="Clear search query"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => {
              const count = allItems.filter(
                (i) =>
                  i.category === cat &&
                  (activeTab === "all" ||
                    (activeTab === "treatments" && i.type === "treatment") ||
                    (activeTab === "diagnostics" && i.type === "diagnostic"))
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-black text-white shadow-xs"
                      : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            3. RESULTS COUNT BANNER
           ===================================================================== */}
        <div className="mt-8 flex items-center justify-between text-xs text-zinc-500 font-medium">
          <div>
            Showing <span className="font-bold text-zinc-900">{filteredItems.length}</span>{" "}
            {activeTab === "treatments"
              ? "treatments"
              : activeTab === "diagnostics"
              ? "diagnostics"
              : "procedures & scans"}
            {selectedCategory !== "all" && (
              <> in <span className="font-semibold text-zinc-800">"{selectedCategory}"</span></>
            )}
            {searchQuery && (
              <> matching <span className="font-semibold text-zinc-800">"{searchQuery}"</span></>
            )}
          </div>
          {(selectedCategory !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* =====================================================================
            4. UNIFIED READABLE CARDS (Grid / List of Procedures)
           ===================================================================== */}
        {filteredItems.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-xs">
            <HelpCircle className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-lg font-bold text-zinc-900">No procedures found</h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">
              We couldn't find any treatment or diagnostic matching "{searchQuery}".
              Try searching for general keywords like "cleaning", "implants", "scan", or "whitening".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setActiveTab("all");
              }}
              className="mt-5 rounded-full bg-black text-white px-6 py-2.5 text-xs font-semibold hover:bg-zinc-800 transition-all"
            >
              Show All Procedures
            </button>
          </div>
        ) : (
          <div className={`mt-8 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8" : "space-y-6"}`}>
            {filteredItems.map((item, index) => {
              const isExpanded = expandedIds.has(item.id);
              const isDiagnostic = item.type === "diagnostic";
              const num = String(index + 1).padStart(2, "0");
              const summaryText = item.whatItIs || item.paragraphs[0];
              const howItWorksText = item.howItWorks || item.paragraphs[1] || summaryText;

              return (
                <article
                  key={item.id}
                  className={`group relative rounded-3xl border transition-all duration-200 overflow-hidden bg-white shadow-xs hover:shadow-md ${
                    isExpanded
                      ? isDiagnostic
                        ? "border-indigo-300/80 ring-1 ring-indigo-200/60"
                        : "border-teal-300/80 ring-1 ring-teal-200/60"
                      : "border-zinc-200/90 hover:border-zinc-300"
                  }`}
                >
                  {/* Card Header & Studio Visual */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        No. {num}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md border ${
                            isDiagnostic
                              ? "bg-indigo-900/80 text-indigo-100 border-indigo-400/40"
                              : "bg-teal-900/80 text-teal-100 border-teal-400/40"
                          }`}
                        >
                          {isDiagnostic ? "🔬 Diagnostic" : "🦷 Treatment"}
                        </span>
                        {item.category && (
                          <span className="hidden sm:inline-block text-xs font-medium text-white/90 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug drop-shadow-sm">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs sm:text-sm font-medium text-white/80 mt-0.5 line-clamp-1">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Content: HIGHLY READABLE PLAIN-ENGLISH MEDICAL TEXT */}
                  <div className="p-6 sm:p-7 space-y-5">
                    {/* Plain English "What it solves" definition */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                        <span>What It Is &amp; How It Helps</span>
                      </div>
                      <p className="text-sm sm:text-[15px] text-zinc-800 leading-relaxed font-normal">
                        {summaryText}
                      </p>
                    </div>

                    {/* Quick Facts Chips (Duration, Comfort, Outcome) */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 p-2.5 text-left">
                        <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-zinc-600" />
                          <span>Timeline</span>
                        </div>
                        <div className="text-xs font-bold text-zinc-900 mt-0.5">
                          {isDiagnostic ? "Same-Day (10-20 min)" : "1 to 2 Sessions"}
                        </div>
                      </div>

                      <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 p-2.5 text-left">
                        <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          <span>Comfort</span>
                        </div>
                        <div className="text-xs font-bold text-zinc-900 mt-0.5">
                          100% Gentle &amp; Pain-Free
                        </div>
                      </div>
                    </div>

                    {/* Toggle Deep-Reading Drawer ("Read Full Step-by-Step Procedure") */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                          isExpanded
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100/90 text-zinc-800 hover:bg-zinc-200/80"
                        }`}
                        aria-expanded={isExpanded}
                      >
                        <span className="flex items-center gap-2">
                          <Activity className="h-3.5 w-3.5 text-teal-400" />
                          <span>
                            {isExpanded
                              ? "Hide Deep Clinical Breakdown"
                              : "Read Full Procedure & Recovery Details"}
                          </span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Expandable Deep Clinical Breakdown */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="space-y-4 pt-2 border-t border-zinc-200 overflow-hidden"
                        >
                          {/* 1. How It Works */}
                          <div className="rounded-2xl bg-zinc-50/80 border border-zinc-200/80 p-4">
                            <div className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                              <span>How the Procedure Works</span>
                            </div>
                            <p className="text-xs sm:text-[13.5px] text-zinc-700 leading-relaxed font-normal">
                              {howItWorksText}
                            </p>
                          </div>

                          {/* 2. Step-by-Step Procedure */}
                          {Array.isArray(item.procedure) && item.procedure.length > 0 && (
                            <div className="rounded-2xl bg-zinc-50/80 border border-zinc-200/80 p-4 space-y-2">
                              <div className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                <span>Step-by-Step Clinical Journey</span>
                              </div>
                              <ol className="space-y-1.5">
                                {item.procedure.map((step, sIdx) => (
                                  <li
                                    key={sIdx}
                                    className="flex items-start gap-2.5 text-xs text-zinc-700 leading-normal"
                                  >
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-mono text-[10px] font-bold text-indigo-700 mt-0.5">
                                      {sIdx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* 3. Key Benefits */}
                          {item.benefits && (
                            <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/70 p-4">
                              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Key Patient Benefits</span>
                              </div>
                              <p className="text-xs sm:text-[13.5px] text-zinc-700 leading-relaxed">
                                {item.benefits}
                              </p>
                            </div>
                          )}

                          {/* 4. What Happens If Delayed / Not Done */}
                          {item.whatIfNotDone && (
                            <div className="rounded-2xl bg-amber-50/60 border border-amber-200/80 p-4">
                              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                <span>Why Timely Care Matters</span>
                              </div>
                              <p className="text-xs sm:text-[13px] text-zinc-700 leading-relaxed">
                                {item.whatIfNotDone}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <Link
                        href={`/book?treatment=${encodeURIComponent(item.title)}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Book {isDiagnostic ? "Scan" : "Treatment"}</span>
                      </Link>

                      <Link
                        href={`/treatments/${item.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-800 hover:border-black hover:text-black transition-all active:scale-95 shadow-2xs"
                      >
                        <span>Full Guide</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Hello, I would like to inquire about ${item.title} at your clinic.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2.5 rounded-full border border-zinc-200 bg-white text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 transition-colors shadow-2xs"
                        aria-label={`Ask about ${item.title} on WhatsApp`}
                        title="Chat with clinic reception on WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =====================================================================
            5. BOTTOM ASSURANCE & EMERGENCY CONTACT BANNER (In the same section)
           ===================================================================== */}
        <div className="mt-16 sm:mt-20 rounded-3xl border border-zinc-200 bg-gradient-to-r from-teal-900 via-zinc-900 to-indigo-950 p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-950/60 border border-teal-500/30 px-3 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                <span>Zero Guesswork Guarantee</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Not sure which diagnostic or treatment you need?
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Schedule a 15-minute clinical consultation. Our chief dental surgeons will conduct an initial 3D scan and outline a clear, transparent, step-by-step treatment plan with no obligations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-zinc-950 px-6 sm:px-8 py-3.5 text-sm font-bold hover:bg-zinc-100 transition-all active:scale-95 shadow-md"
              >
                <Calendar className="h-4 w-4 text-teal-700" />
                <span>Schedule Consultation</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-medium text-white hover:bg-white/20 transition-all active:scale-95"
              >
                <span>Contact Clinic</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
