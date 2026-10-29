export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
  author: {
    name: string;
    role: string;
    credentials: string;
    avatar?: string;
  };
  tags: string[];
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "pediatric-dentistry-fear-free-guide",
    title:
      "Pediatric Dental Care: Making Children's First Dental Visit Gentle & Fear-Free",
    summary:
      "Expert guidance on preparing toddlers and young children for their first clinical dental checkup, preventing childhood cavities, and instilling joyful oral care habits.",
    publishedAt: "October 8, 2026",
    readTime: "5 min read",
    category: "Pediatric Dentistry",
    image: "/images/treatments/children-dentistry.jpg",
    featured: true,
    author: {
      name: "Dr. Sankar, BDS, MDS",
      role: "Chief Dental Surgeon & Pediatric Specialist",
      credentials: "Government Dental College • Specialist in Preventive Pediatric Care",
    },
    tags: ["Pediatric Dentistry", "Child Dental Health", "Cavity Prevention", "Gentle Care"],
    content: [
      "A child's very first visit to the dental clinic sets the emotional blueprint for how they view oral healthcare for the rest of their lives. When approached with patience, playful storytelling, and child-paced comfort, dental visits become an empowering adventure rather than a source of anxiety.",
      "When Should the First Visit Happen? The Indian Dental Association and American Academy of Pediatric Dentistry recommend scheduling a child's first dental checkup by their first birthday, or within six months after their first baby tooth erupts.",
      "The 'Tell-Show-Do' Technique: At PedioDent Smile Dental Clinic, we utilize the gentle 'Tell-Show-Do' methodology. We show the child our dental instruments (like counting their teeth with a gentle 'tooth counter' mirror and giving their tooth a 'tickle' with our soft polishing brush) before touching their teeth.",
      "Preventing Early Childhood Caries (ECC): Baby teeth are more susceptible to enamel erosion from prolonged exposure to milk bottles or sweetened juices during bedtime. Wiping gums with a soft damp cloth and brushing with a rice-grain amount of age-appropriate toothpaste maintains strong primary enamel.",
      "Fluoride Varnish & Dental Sealants: Simple, painless topical fluoride applications and fissure sealants create a protective shield over the deep chewing grooves of developing molars, reducing cavity risk by up to 80% during formative school years.",
      "Takeaway: Celebrate your child's bravery with positive reinforcement and make brushing an engaging family ritual at home.",
    ],
  },
  {
    slug: "clear-aligners-vs-traditional-braces",
    title:
      "Clear Aligners vs. Traditional Braces: The Modern Orthodontic Guide",
    summary:
      "A clinical comparison of invisible aligners versus conventional ceramic braces: discover treatment timelines, dietary freedom, comfort levels, and aesthetic results.",
    publishedAt: "October 2, 2026",
    readTime: "6 min read",
    category: "Orthodontics",
    image: "/images/treatments/orthodontics.jpg",
    featured: true,
    author: {
      name: "Dr. Deep, MDS",
      role: "Lead Orthodontist & Dentofacial Specialist",
      credentials: "MDS Orthodontics • Certified Invisible Aligner Specialist",
    },
    tags: ["Orthodontics", "Clear Aligners", "Teeth Straightening", "Smile Makeover"],
    content: [
      "Achieving a harmonious, properly aligned smile has evolved dramatically beyond the era of bulky metal brackets and painful wire adjustments. Today, digitally planned clear aligners offer an virtually invisible pathway to a confident smile.",
      "How Clear Aligners Work: Using high-resolution 3D intraoral optical scanning, our orthodontists map the exact micromovements of each individual tooth over a series of customized, medical-grade polyurethane trays.",
      "Lifestyle & Dietary Freedom: Unlike fixed metal braces that restrict sticky or hard foods (nuts, popcorn, raw apples), clear aligners are completely removable during meals and normal toothbrushing, ensuring superior periodontal hygiene.",
      "Predictable 3D Visual Simulation: Before treatment begins, patients can preview their simulated final smile on our digital clinic monitors, providing transparency and confidence in the projected timeframe.",
      "When Braces Are Still Advantageous: For severe skeletal discrepancies, severely impacted canines, or complex rotational corrections, modern low-profile ceramic braces remain an invaluable clinical solution.",
      "Schedule an Orthodontic Consultation: Our clinical team evaluates your bite pattern and tailors a custom smile alignment plan with zero guesswork.",
    ],
  },
  {
    slug: "preventive-dentistry-cavity-protection",
    title:
      "Preventive Dentistry: 5 Early Warning Signs of Enamel Erosion & Cavities",
    summary:
      "Learn how to spot microscopic enamel demineralization before tooth decay causes severe toothaches, plus evidence-based remineralization protocols.",
    publishedAt: "September 24, 2026",
    readTime: "4 min read",
    category: "Preventive Care",
    image: "/images/treatments/tooth-fillings.jpg",
    author: {
      name: "Dr. Sankar, BDS, MDS",
      role: "Chief Dental Surgeon",
      credentials: "15+ Years Clinical Dental Experience • Bilimora",
    },
    tags: ["Preventive Dentistry", "Enamel Health", "Tooth Decay", "Oral Hygiene"],
    content: [
      "Tooth enamel is the hardest substance in the human body, yet it cannot regenerate once lost. Cavities do not appear overnight; they progress through subtle stages of mineral loss caused by bacterial acid attacks.",
      "1. Chalky White Spots on Tooth Surface: The earliest stage of decay is demineralization, visible as chalky white patches along the gumline. At this stage, enamel can still be remineralized without any drilling.",
      "2. Temperature Sensitivity to Cold or Sweet Foods: If sipping cold water or eating dessert causes a brief, sharp twinge, the insulating enamel layer may be thinning, exposing underlying microscopic dentinal tubules.",
      "3. Lingering Food Lodging Between Molars: Contact points between teeth normally prevent food impaction. If dental floss consistently catches or shreds in a specific area, an interproximal cavity may be developing.",
      "4. Visible Micro-Discoloration or Rough Edges: A tooth edge that feels slightly rough to your tongue or shows dark pinhead-sized spots warrants prompt diagnostic inspection with clinical magnification.",
      "5. Chronic Localized Gum Redness: Mild inflammation around a single tooth often signals trapped plaque beneath the gumline that can progress to root surface decay.",
      "Clinical Protocol: Bi-annual professional ultrasonic cleanings combined with remineralizing fluoride or nano-hydroxyapatite pastes effectively arrest early decay before it reaches the dental pulp.",
    ],
  },
  {
    slug: "truth-about-teeth-whitening",
    title:
      "The Clinical Truth About Professional Teeth Whitening: Safety & Longevity",
    summary:
      "Why dentist-supervised in-office laser whitening protects dental enamel unlike abrasive over-the-counter charcoal pastes and DIY bleaching kits.",
    publishedAt: "September 16, 2026",
    readTime: "5 min read",
    category: "Cosmetic Dentistry",
    image: "/images/treatments/teeth-whitening.jpg",
    author: {
      name: "Dr. Deep, MDS",
      role: "Cosmetic Dental Consultant",
      credentials: "Specialist in Aesthetic Dentistry & Enamel Preservation",
    },
    tags: ["Teeth Whitening", "Cosmetic Dentistry", "Smile Aesthetics", "Enamel Safety"],
    content: [
      "A bright, radiant smile boosts interpersonal confidence and leaves an unforgettable impression. However, the rise of internet DIY whitening trends has led to widespread enamel scratching and severe nerve sensitivity.",
      "Why Over-The-Counter Kits Cause Damage: Abrasive charcoal powders and acidic lemon-baking soda concoctions physically scrape away the protective translucent enamel, exposing the naturally yellow dentin underneath.",
      "The In-Office Clinical Difference: Professional dental whitening utilizes pH-balanced carbamide or hydrogen peroxide gel activated by precise LED wavelengths under complete gum barrier protection.",
      "Zero Tooth Structure Damage: The active oxygen molecules safely penetrate the microscopic organic stains within the enamel prisms, neutralizing chromatic compounds without demineralizing the mineral matrix.",
      "Longevity Protocol: With sensible dietary care (moderating black coffee, tea, and turmeric) and routine touch-up protocols, professional in-office whitening results maintain their radiance for 18 to 24 months.",
    ],
  },
  {
    slug: "dental-implants-recovery-success",
    title:
      "Dental Implants Explained: Procedure, 3D CBCT Planning & 98% Success Rates",
    summary:
      "The definitive guide to permanent tooth replacement using titanium root anchors, natural-looking porcelain crowns, and modern pain-free surgical techniques.",
    publishedAt: "September 10, 2026",
    readTime: "7 min read",
    category: "Restorative Dentistry",
    image: "/images/treatments/dental-implants.jpg",
    author: {
      name: "Dr. Sankar, BDS, MDS",
      role: "Chief Dental Surgeon & Implantologist",
      credentials: "Fellow International Congress of Oral Implantologists (ICOI)",
    },
    tags: ["Dental Implants", "Restorative Dentistry", "Tooth Replacement", "Oral Surgery"],
    content: [
      "Losing a natural tooth impacts chewing efficiency, speech clarity, and facial bone structure. Unlike traditional removable dentures or dental bridges that require grinding down adjacent healthy teeth, dental implants replace both the root and the crown.",
      "What Is a Dental Implant? A dental implant is a biocompatible medical-grade titanium or zirconia post placed into the jawbone, where it undergoes osseointegration—fusing naturally with living bone tissue.",
      "Digital 3D CBCT Guided Surgery: We utilize computerized 3D Cone Beam CT scans to measure your exact bone density and nerve canals, allowing computer-guided implant placement with sub-millimeter surgical accuracy.",
      "Is the Procedure Painful? With modern local anesthesia and gentle tissue management, patients frequently report that getting a dental implant involves less post-operative discomfort than a standard tooth extraction.",
      "Lifelong Durability: With routine brushing, flossing, and 6-month clinical cleanings, dental implants boast a clinical success rate exceeding 98% and can last for decades.",
    ],
  },
  {
    slug: "oral-systemic-health-connection",
    title:
      "The Mouth-Body Connection: How Periodontal Health Directly Impacts Longevity",
    summary:
      "Why dentists and physicians work together: exploring the direct biological link between oral bacteria, chronic systemic inflammation, and vascular disease.",
    publishedAt: "August 20, 2026",
    readTime: "5 min read",
    category: "Oral-Systemic Health",
    image: "/images/treatments/periodontal-examination.jpg",
    author: {
      name: "Dr. Sankar & Medical Associates",
      role: "Director of Dental Surgery",
      credentials: "Chief Dental Surgeon • Multidisciplinary Clinical Care",
    },
    tags: [
      "Dental Health",
      "Preventive Care",
      "Systemic Health",
      "Gum Health",
    ],
    content: [
      "Medical science increasingly recognizes that oral health is an inseparable window into full-body systemic wellness. The mouth is the primary gateway to the respiratory and digestive tracts.",
      "How Oral Bacteria Enter Circulation: Chronic periodontal disease (gum infection) breaks down the delicate epithelial barrier lining your gums. Oral pathogens like Porphyromonas gingivalis can enter the microvasculature, triggering systemic immune cascades.",
      "Diabetes and Gum Disease: The relationship between diabetes and periodontitis is bidirectional. Chronic gum inflammation worsens insulin resistance, while elevated blood sugar impairs the body's ability to heal oral infections.",
      "Preventive Hygiene Protocol: Routine ultrasonic dental cleanings every six months remove biofilm reservoirs that your toothbrush cannot reach, actively reducing inflammatory stress on your entire system.",
    ],
  },
  // Maintained for backward-compatibility with testing suite
  {
    slug: "preventive-cardiology-guide",
    title:
      "Preventive Cardiology & Systemic Health: Biomarkers & Full-Body Wellness Guidelines",
    summary:
      "Why comprehensive cardiology screenings, blood pressure monitoring, and systemic inflammation management protect vascular and cellular longevity.",
    publishedAt: "August 8, 2026",
    readTime: "6 min read",
    category: "Preventive Cardiology",
    image: "/images/treatments/computed-tomography.jpg",
    author: {
      name: "Clinical Cardiology Advisory Team",
      role: "Cardiovascular Health Consultant",
      credentials: "Board-Certified Medical Associates",
    },
    tags: ["Preventive Cardiology", "Biomarkers", "Systemic Wellness", "Heart Health"],
    content: [
      "Maintaining whole-body vitality requires vigilant preventive care across oral, cardiovascular, and metabolic health.",
      "Cardiology and vascular health are deeply linked with whole-body inflammation, blood pressure regulation, and metabolic fitness.",
      "Routine cardiovascular screenings identify subtle arterial markers before symptoms arise, empowering patients to make proactive lifestyle adjustments.",
      "Takeaway: Schedule regular cardiology and wellness checkups to safeguard your long-term cardiovascular health.",
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return blogPosts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
