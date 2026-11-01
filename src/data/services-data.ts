export interface ClinicalService {
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  duration: string;
  price?: string;
  leadSpecialist: string;
  indications: string[];
  whatToExpect: string[];
  preparation: string[];
  faqs: { question: string; answer: string }[];
}

export const clinicalServices: ClinicalService[] = [
  {
    slug: "dental-consultation",
    name: "Comprehensive Dental Examination & Consultation",
    category: "General Dentistry",
    summary:
      "Thorough oral health assessment, digital intraoral screening, cavity detection, and custom treatment planning.",
    description:
      "Our comprehensive dental consultation provides an in-depth examination of your teeth, gums, and oral structures. Using modern digital radiography and intraoral imaging, Dr. Deep Patel evaluates your oral health, identifies early decay or periodontal concerns, and discusses transparent treatment options tailored to your smile.",
    duration: "30 mins",
    leadSpecialist: "Dr. Deep A Patel, BDS (Chief Dental Surgeon)",
    indications: [
      "Routine 6-month preventive dental checkup & cleaning",
      "Tooth pain, sensitivity to hot/cold, or gum bleeding",
      "Cavity screening and tartar/calculus assessment",
      "Smile makeover and teeth alignment evaluation",
    ],
    whatToExpect: [
      "Digital intraoral camera examination of all teeth and gums",
      "Low-radiation digital radiography (X-rays) if clinically indicated",
      "Detailed periodontal gum pocket depth mapping",
      "One-on-one consultation and personalized treatment plan with Dr. Deep Patel",
    ],
    preparation: [
      "Brush and floss normally before arriving for your appointment",
      "Bring any previous dental records or X-rays if available",
      "List any current medications or systemic health conditions (e.g., diabetes, hypertension)",
    ],
    faqs: [
      {
        question: "How long does the dental consultation take?",
        answer:
          "A standard comprehensive consultation and digital examination typically takes 20 to 30 minutes.",
      },
      {
        question: "Will I need dental X-rays during my checkup?",
        answer:
          "Digital X-rays are only taken if needed to detect hidden decay between teeth or assess root structures beneath the gum line.",
      },
    ],
  },
  {
    slug: "root-canal-treatment",
    name: "Single-Visit Painless Root Canal Treatment",
    category: "Endodontics",
    summary:
      "Advanced rotary endodontics to eliminate deep tooth infection, relieve severe toothache, and save natural teeth.",
    description:
      "Our modern root canal therapy saves severely infected, decayed, or fractured teeth while completely preserving your natural dental structure. Using computer-controlled rotary instruments, digital apex locators, and potent local anesthesia, Dr. Deep Patel performs comfortable, virtually painless single-visit root canal treatments.",
    duration: "45 mins",
    leadSpecialist: "Dr. Deep A Patel, BDS (Chief Dental Surgeon)",
    indications: [
      "Severe or throbbing tooth pain, especially when chewing or biting",
      "Prolonged sensitivity to hot or cold food and drinks",
      "Deep dental decay reaching the internal nerve (pulp)",
      "Swelling or tenderness in the gums near an infected tooth",
    ],
    whatToExpect: [
      "Complete painless local anesthesia for maximum patient comfort",
      "Gentle removal of infected dental pulp using modern rotary instruments",
      "Disinfection and hermetic bio-compatible sealing of root canals",
      "Placement of a protective crown to restore full chewing strength",
    ],
    preparation: [
      "Eat a light meal prior to your appointment unless advised otherwise",
      "Take your routine medications as prescribed",
      "Inform the doctor about any dental anxiety so we can ensure extra comfort",
    ],
    faqs: [
      {
        question: "Is root canal treatment painful?",
        answer:
          "No. With modern local anesthetics and rotary endodontic technology, the procedure is as comfortable as getting a routine filling and eliminates existing tooth pain.",
      },
      {
        question: "Can the root canal be completed in a single visit?",
        answer:
          "Yes. Most non-complicated cases at CA Smile are successfully completed in a single comfortable visit of approximately 45 minutes.",
      },
    ],
  },
  {
    slug: "dental-implants",
    name: "Permanent Dental Implants & Tooth Replacement",
    category: "Implantology",
    summary:
      "Permanent titanium implants that replace missing teeth, restore full chewing power, and protect jawbone health.",
    description:
      "Dental implants are the gold standard for replacing missing teeth. A biocompatible medical-grade titanium fixture integrates seamlessly with your jawbone, acting as a permanent artificial tooth root crowned with a natural-looking ceramic or zirconia tooth.",
    duration: "60 mins",
    leadSpecialist: "Dr. Deep A Patel, BDS (Chief Dental Surgeon)",
    indications: [
      "Single or multiple missing teeth due to extraction or trauma",
      "Difficulty chewing food or speaking due to gaps in teeth",
      "Desire for permanent fixed teeth instead of removable dentures",
      "Prevention of bone loss and drifting of adjacent natural teeth",
    ],
    whatToExpect: [
      "High-precision 3D digital implant planning and bone assessment",
      "Gentle surgical placement of the biocompatible titanium implant fixture",
      "Healing period for osseointegration (natural bone bonding)",
      "Attachment of a custom-milled zirconia crown matched to your natural tooth shade",
    ],
    preparation: [
      "Maintain thorough oral hygiene by brushing and flossing before your visit",
      "Complete any pre-surgical blood investigations if advised",
      "Wear comfortable clothing for your procedure",
    ],
    faqs: [
      {
        question: "How long do dental implants last?",
        answer:
          "With proper oral hygiene and regular 6-month checkups, dental implants can last a lifetime, making them the most cost-effective long-term tooth replacement.",
      },
      {
        question: "Are dental implants noticeable to other people?",
        answer:
          "Not at all. The custom zirconia crown emerges naturally from your gum line and matches your surrounding teeth perfectly in color, translucency, and shape.",
      },
    ],
  },
  {
    slug: "digital-smile-design",
    name: "Digital Smile Design & Aesthetic Veneers",
    category: "Cosmetic Dentistry",
    summary:
      "Computerized 3D smile planning and ultra-thin porcelain veneers for a symmetrical, confident, and radiant smile.",
    description:
      "Digital Smile Design (DSD) uses facial photography, digital 3D scans, and cosmetic software to design your ideal smile before treatment even begins. Experience predictable, customized smile makeovers utilizing ultra-thin porcelain veneers, composite laminates, and aesthetic contouring.",
    duration: "45 mins",
    leadSpecialist: "Dr. Deep A Patel, BDS (Chief Dental Surgeon)",
    indications: [
      "Chipped, worn, uneven, or fractured front teeth",
      "Severe enamel discoloration or stubborn intrinsic stains",
      "Gaps (diastema) between teeth or minor misalignment",
      "Desire for a brighter, harmonious, and confident smile",
    ],
    whatToExpect: [
      "High-resolution facial and intraoral photographic mapping",
      "Interactive 3D digital preview of your proposed new smile",
      "Trial smile mock-up to test aesthetic proportions in real life",
      "Precision bonding of custom porcelain veneers or cosmetic restorations",
    ],
    preparation: [
      "Bring reference photographs of smiles you admire if you have specific aesthetic preferences",
      "Ensure gums are healthy and tartar-free prior to aesthetic veneer placement",
    ],
    faqs: [
      {
        question: "Can I see my new smile before treatment starts?",
        answer:
          "Yes! Digital Smile Design allows you to preview a 3D digital simulation and physical mock-up directly on your teeth before any permanent changes are made.",
      },
    ],
  },
  {
    slug: "teeth-cleaning-scaling",
    name: "Ultrasonic Scaling & Periodontal Gum Care",
    category: "Preventive Dentistry",
    summary:
      "Painless ultrasonic tartar removal, enamel polishing, and deep periodontal cleaning for healthy gums and fresh breath.",
    description:
      "Routine brushing cannot remove hardened tartar (calculus) that accumulates below the gum line. Our advanced ultrasonic scaling and airflow polishing gently removes plaque, external tobacco/tea stains, and bacterial deposits, preventing gingivitis and protecting bone support.",
    duration: "30 mins",
    leadSpecialist: "Dr. Deep A Patel, BDS (Chief Dental Surgeon)",
    indications: [
      "Bleeding or swollen gums during brushing or flossing",
      "Visible yellow, brown, or black tartar buildup behind teeth",
      "Persistent bad breath (halitosis)",
      "Routine 6-month preventive hygiene maintenance",
    ],
    whatToExpect: [
      "Gentle ultrasonic vibration and water mist to dislodge hard calculus",
      "Interdental scaling to clean hard-to-reach contact areas",
      "Prophy-paste micro-abrasive polishing to leave enamel smooth and glossy",
      "Personalized oral hygiene instructions and brushing technique coaching",
    ],
    preparation: [
      "Brush normally before your appointment",
      "Inform the doctor if you experience tooth sensitivity so we can use warm water and topical numbing gel",
    ],
    faqs: [
      {
        question: "Does teeth cleaning make teeth loose or create gaps?",
        answer:
          "No, this is a common myth. Scaling only removes harmful bacterial tartar. Removing tartar helps inflamed gums heal and attach firmly back to your teeth.",
      },
    ],
  },
  {
    slug: "clear-aligners",
    name: "Clear Aligners & Invisible Orthodontics",
    category: "Orthodontics",
    summary:
      "Virtually invisible, removable clear aligners to straighten crooked teeth and correct bite issues comfortably without metal wires.",
    description:
      "Achieve straight teeth and a confident smile discreetly. Custom transparent plastic aligners apply gentle, continuous force to move teeth into ideal alignment without unsightly metal brackets, dietary restrictions, or mouth sores.",
    duration: "40 mins",
    leadSpecialist: "Dr. Deep A Patel, BDS & Specialist Orthodontic Team",
    indications: [
      "Crowded, crooked, or overlapping teeth",
      "Gaps and spaces between teeth",
      "Overbite, underbite, or crossbite alignment issues",
      "Adults and teens seeking discreet orthodontic treatment without metal braces",
    ],
    whatToExpect: [
      "3D digital optical impression — no messy impression putty",
      "Computerized treatment simulation showing step-by-step tooth movement",
      "Delivery of custom aligner trays with wearing schedule guidelines",
      "Quick periodic checkups every 6 to 8 weeks to monitor progress",
    ],
    preparation: [
      "Complete routine scaling/cleaning before starting aligner therapy",
      "Wear aligners for 20 to 22 hours per day, removing only to eat and brush",
    ],
    faqs: [
      {
        question: "How long does clear aligner treatment take?",
        answer:
          "Treatment typically ranges from 6 to 18 months depending on the complexity of tooth movement required.",
      },
    ],
  },
  {
    slug: "teeth-whitening",
    name: "Professional Laser Teeth Whitening",
    category: "Cosmetic Dentistry",
    summary:
      "Safe, in-office laser teeth bleaching to brighten stained enamel by up to 6–8 shades in a single comfortable session.",
    description:
      "Safely eliminate years of stubborn coffee, tea, turmeric, and smoking stains. Our professional in-office laser teeth whitening uses specialized dental-grade bleaching gel activated by cool LED/laser light to deliver immediate, dramatic, and long-lasting brightness without damaging enamel.",
    duration: "45 mins",
    leadSpecialist: "Dr. Deep A Patel, BDS (Chief Dental Surgeon)",
    indications: [
      "Yellowed or discolored teeth from tea, coffee, or spices",
      "Smoking or tobacco stain accumulation",
      "Upcoming wedding, job interview, or special event",
      "Desire for a noticeably brighter, refreshed smile",
    ],
    whatToExpect: [
      "Shade guide assessment to record your starting tooth shade",
      "Protective gingival barrier applied to safeguard gums and lips",
      "Professional whitening gel applied and light-activated in 15-minute cycles",
      "Post-treatment fluoride desensitizing polish and shade comparison",
    ],
    preparation: [
      "We recommend a routine dental cleaning beforehand for optimal whitening penetration",
      "Avoid intensely colored foods/drinks (red wine, dark tea, coffee) for 48 hours post-treatment",
    ],
    faqs: [
      {
        question: "Does teeth whitening damage the enamel?",
        answer:
          "No. Professional dental whitening safely lifts microscopic stains from within the enamel pores without altering the structural integrity of your tooth enamel.",
      },
    ],
  },
  {
    slug: "pediatric-dentistry",
    name: "Pediatric Dental Care for Children",
    category: "Pediatric Dentistry",
    summary:
      "Gentle, stress-free dental care for kids, including cavity prevention, dental sealants, and painless fillings.",
    description:
      "We believe a child's early dental experiences shape their lifelong oral health. Using our gentle 'Tell-Show-Do' approach, Dr. Deep Patel creates a fun, reassuring environment for children of all ages to ensure positive, cavity-free smiles.",
    duration: "30 mins",
    leadSpecialist: "Dr. Deep A Patel, BDS (Chief Dental Surgeon)",
    indications: [
      "Child's first dental checkup (recommended by age 1 or first tooth)",
      "Tooth pain or cavities in milk teeth",
      "Preventive fluoride application and dental fissure sealants",
      "Habit counseling (thumb sucking, mouth breathing)",
    ],
    whatToExpect: [
      "Friendly, unhurried introduction to the dental chair and instruments",
      "Gentle tooth counting and plaque check",
      "Protective cavity-preventing fluoride varnish application",
      "Fun oral hygiene guidance and brushing demonstration for child and parents",
    ],
    preparation: [
      "Talk positively to your child about visiting the friendly dentist",
      "Avoid using words like 'pain', 'shot', or 'needle' at home",
      "Schedule morning appointments when children are well-rested",
    ],
    faqs: [
      {
        question: "Why treat cavities in milk teeth if they fall out anyway?",
        answer:
          "Milk teeth hold space for permanent adult teeth and are vital for proper chewing, speech, and jaw development. Untreated infections can damage developing permanent teeth underneath.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): ClinicalService | undefined {
  return clinicalServices.find((s) => s.slug === slug);
}
