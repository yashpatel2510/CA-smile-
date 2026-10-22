import fs from "fs";
import path from "path";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
}

export interface FaqsConfig {
  tag: string;
  headingLine1: string;
  headingLine2: string;
  subtitle: string;
  themeMode: "light" | "dark";
  faqs: FaqItem[];
}

const FAQS_FILE = path.join(process.cwd(), "src/data/faqs-config.json");

export const DEFAULT_CONFIG: FaqsConfig = {
  tag: "• FAQS",
  headingLine1: "QUESTIONS,",
  headingLine2: "ANSWERED",
  subtitle: "Here are the most common questions before starting a project with us.",
  themeMode: "light",
  faqs: [
    {
      id: "faq-1",
      question: "How long does a full project take?",
      answer:
        "A standard project or comprehensive clinical transformation typically takes between 1 to 4 weeks depending on the treatment scope. Minor aesthetic touch-ups or single-visit restorations can often be completed in a single afternoon session, while custom aligners or multi-stage implant procedures are scheduled across comfortable milestones.",
      category: "General",
      isActive: true,
      isFeatured: true,
      order: 1,
    },
    {
      id: "faq-2",
      question: "Do you offer ongoing support after launch?",
      answer:
        "Yes, absolutely. We provide post-treatment follow-up consultations, preventative maintenance schedules, and ongoing direct communication with our clinical coordinators to ensure lasting results, comfort, and peace of mind.",
      category: "General",
      isActive: true,
      isFeatured: true,
      order: 2,
    },
    {
      id: "faq-3",
      question: "Can we start with only branding or only website?",
      answer:
        "Yes, you can begin with a focused phase such as a comprehensive diagnostic consultation or initial aesthetic smile assessment. Once you're fully satisfied with the blueprint and visualization, you have complete freedom to proceed with subsequent treatments at your own pace.",
      category: "General",
      isActive: true,
      isFeatured: true,
      order: 3,
    },
    {
      id: "faq-4",
      question: "What do we need to provide before starting?",
      answer:
        "For clinical consultations, you simply need your identification and any prior medical or dental records if available. Everything else—including high-resolution 3D digital oral scans, computerized imaging, and diagnostic profiling—is handled on-site during your initial visit.",
      category: "General",
      isActive: true,
      isFeatured: true,
      order: 4,
    },
    {
      id: "faq-5",
      question: "Do you work with startups or only large companies?",
      answer:
        "We work with patients and clients of all backgrounds—from individual pediatric children and working professionals to entire corporate wellness programs. Our care plans and service packages are customized to fit your specific needs and timeline.",
      category: "General",
      isActive: true,
      isFeatured: true,
      order: 5,
    },
    {
      id: "faq-6",
      question: "How is pricing calculated?",
      answer:
        "Pricing is 100% transparent with zero hidden fees. After an initial clinical evaluation and 3D digital diagnosis, we provide a detailed itemized estimate outlining every phase, material option, and available flexible installment or insurance coverage plan before any work begins.",
      category: "General",
      isActive: true,
      isFeatured: true,
      order: 6,
    },
    {
      id: "faq-7",
      question: "Are treatments and procedures painless?",
      answer:
        "Yes. We utilize advanced computerized painless local anesthesia, gentle rotary endodontics, and needle-free techniques designed specifically to eliminate discomfort and dental anxiety. Over 98% of our patients report feeling virtually nothing during procedures.",
      category: "Treatments",
      isActive: true,
      isFeatured: true,
      order: 7,
    },
    {
      id: "faq-8",
      question: "How do I book or reschedule an appointment?",
      answer:
        "You can schedule instantly using our online booking calendar, message our 24/7 automated WhatsApp desk, or call reception directly. Rescheduling is easy and can be done anytime up to 2 hours prior to your scheduled slot.",
      category: "Appointments",
      isActive: true,
      isFeatured: true,
      order: 8,
    },
  ],
};

export function getFaqsConfig(): FaqsConfig {
  try {
    if (fs.existsSync(FAQS_FILE)) {
      const data = fs.readFileSync(FAQS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return {
        tag: parsed.tag || DEFAULT_CONFIG.tag,
        headingLine1: parsed.headingLine1 || DEFAULT_CONFIG.headingLine1,
        headingLine2: parsed.headingLine2 || DEFAULT_CONFIG.headingLine2,
        subtitle: parsed.subtitle || DEFAULT_CONFIG.subtitle,
        themeMode: parsed.themeMode === "dark" ? "dark" : "light",
        faqs: Array.isArray(parsed.faqs) ? parsed.faqs : DEFAULT_CONFIG.faqs,
      };
    }
  } catch (err) {
    console.error("[FaqsStore] Error reading FAQs configuration:", err);
  }
  return DEFAULT_CONFIG;
}

export function saveFaqsConfig(config: FaqsConfig): boolean {
  try {
    const dir = path.dirname(FAQS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FAQS_FILE, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[FaqsStore] Error saving FAQs configuration:", err);
    return false;
  }
}

export function updateFaqSettings(settings: Partial<Omit<FaqsConfig, "faqs">>): FaqsConfig {
  const current = getFaqsConfig();
  const updated: FaqsConfig = {
    ...current,
    ...settings,
    themeMode: settings.themeMode === "dark" ? "dark" : settings.themeMode === "light" ? "light" : current.themeMode,
  };
  saveFaqsConfig(updated);
  return updated;
}

export function addFaqItem(item: Omit<FaqItem, "id">): FaqItem {
  const current = getFaqsConfig();
  const maxOrder = current.faqs.reduce((max, f) => Math.max(max, f.order || 0), 0);
  const newItem: FaqItem = {
    id: `faq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    question: item.question,
    answer: item.answer,
    category: item.category || "General",
    isActive: item.isActive !== false,
    isFeatured: item.isFeatured !== false,
    order: item.order ?? maxOrder + 1,
  };
  current.faqs.push(newItem);
  saveFaqsConfig(current);
  return newItem;
}

export function updateFaqItem(id: string, updates: Partial<FaqItem>): FaqItem | null {
  const current = getFaqsConfig();
  const idx = current.faqs.findIndex((f) => f.id === id);
  if (idx === -1) return null;

  current.faqs[idx] = {
    ...current.faqs[idx],
    ...updates,
    id, // protect id
  };
  saveFaqsConfig(current);
  return current.faqs[idx];
}

export function deleteFaqItem(id: string): boolean {
  const current = getFaqsConfig();
  const initialLen = current.faqs.length;
  current.faqs = current.faqs.filter((f) => f.id !== id);
  if (current.faqs.length === initialLen) return false;
  saveFaqsConfig(current);
  return true;
}

export function reorderFaqItems(orderedIds: string[]): FaqItem[] {
  const current = getFaqsConfig();
  const map = new Map(current.faqs.map((f) => [f.id, f]));
  const reordered: FaqItem[] = [];

  orderedIds.forEach((id, index) => {
    const item = map.get(id);
    if (item) {
      item.order = index + 1;
      reordered.push(item);
      map.delete(id);
    }
  });

  // Append any items that weren't in orderedIds
  map.forEach((item) => {
    item.order = reordered.length + 1;
    reordered.push(item);
  });

  current.faqs = reordered;
  saveFaqsConfig(current);
  return reordered;
}

// Backwards-compatibility aliases if needed
export const getFaqsStoreData = getFaqsConfig;
export const saveFaqsStoreData = saveFaqsConfig;
export const DEFAULT_FAQS_STORE = DEFAULT_CONFIG;
