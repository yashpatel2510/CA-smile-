export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  isActive: boolean;
  order: number;
}

export interface FaqSettings {
  title: string;
  subtitle: string;
  supportText: string;
  supportLinkText: string;
  supportLinkHref: string;
  mode: "light" | "dark" | "clinic";
  layout: "grid" | "centered";
  showFaqSection: boolean;
}

export interface FaqsStoreData {
  settings: FaqSettings;
  items: FaqItem[];
}

export const DEFAULT_FAQS_STORE: FaqsStoreData = {
  settings: {
    title: "Frequently Asked Questions",
    subtitle:
      "Discover quick and comprehensive answers about our gentle treatments, pain-free dental procedures, and appointment scheduling.",
    supportText: "Can't find what you're looking for? Contact our",
    supportLinkText: "clinical support team",
    supportLinkHref: "/contact",
    mode: "light",
    layout: "grid",
    showFaqSection: true,
  },
  items: [
    {
      id: "faq-1",
      question: "Are dental procedures and treatments painful?",
      answer:
        "Not at all. At our clinic, patient comfort is our utmost priority. We utilize computerized painless local anesthesia wands, topical numbing gels, and modern rotary instruments so that cleanings, fillings, root canals, and cosmetic treatments remain virtually pain-free.",
      category: "Comfort & Pain Relief",
      isActive: true,
      order: 1,
    },
    {
      id: "faq-2",
      question: "How often should I schedule a dental checkup and cleaning?",
      answer:
        "We recommend a routine preventive examination and ultrasonic scaling every 6 months. Regular visits detect microscopic enamel demineralization before cavities form, remove hardened calculus, and protect your gums from periodontal disease.",
      category: "Preventive Care",
      isActive: true,
      order: 2,
    },
    {
      id: "faq-3",
      question: "What payment methods and financing options do you accept?",
      answer:
        "We accept all major credit and debit cards (Visa, MasterCard, RuPay), UPI, Net Banking, and cash. For comprehensive procedures like dental implants, full smile makeovers, and clear aligners, zero-interest flexible monthly installment plans (EMI) are also available.",
      category: "Billing & Payments",
      isActive: true,
      order: 3,
    },
    {
      id: "faq-4",
      question: "What should I do during a sudden dental emergency?",
      answer:
        "If you experience severe unmanageable toothache, facial swelling, a knocked-out tooth, or a broken crown, reach out immediately via our WhatsApp desk or emergency helpline. We reserve dedicated daily emergency slots for immediate relief.",
      category: "Emergency Care",
      isActive: true,
      order: 4,
    },
    {
      id: "faq-5",
      question: "How do Clear Aligners work compared to traditional metal braces?",
      answer:
        "Clear aligners are custom-crafted transparent trays that gradually guide your teeth into proper alignment without wires or metal brackets. They are virtually invisible, removable for eating and brushing, and engineered via high-precision 3D digital oral scans.",
      category: "Orthodontics",
      isActive: true,
      order: 5,
    },
    {
      id: "faq-6",
      question: "How do you ensure a calm, fear-free experience for young children?",
      answer:
        "Our pediatric specialists use the proven 'Tell-Show-Do' technique. We introduce each dental instrument with kid-friendly names, encourage curiosity, and perform gentle, tear-free checkups in a warm, welcoming environment with positive rewards.",
      category: "Pediatric Dentistry",
      isActive: true,
      order: 6,
    },
  ],
};
