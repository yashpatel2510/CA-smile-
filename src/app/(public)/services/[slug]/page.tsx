import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTreatmentById } from "@/lib/treatments-store";

interface ServicePageProps {
  params: {
    slug: string;
  };
}

// Dummy medical template slugs from initial template that Google indexed and must be purged
const DELETED_DUMMY_TEMPLATE_SLUGS = new Set([
  "cardiology-diagnostic-panel",
  "general-consultation",
  "pediatric-wellness-vaccination",
  "neurology-migraine-care",
  "dental-prophylaxis-hygiene",
  "executive-health-concierge",
]);

const SERVICE_TO_TREATMENT_MAP: Record<string, string> = {
  "clear-aligners": "orthodontics",
  "teeth-cleaning-scaling": "gum-treatment",
  "pediatric-dentistry": "children-dentistry",
  "dental-consultation": "dental-consultation",
};

// Do not pre-render duplicate /services/[slug] static pages
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  if (DELETED_DUMMY_TEMPLATE_SLUGS.has(params.slug)) {
    return {
      title: "Page Removed | CA Smile Dental Clinic",
      robots: {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
      },
    };
  }

  const targetSlug = SERVICE_TO_TREATMENT_MAP[params.slug] || params.slug;
  return {
    title: "Redirecting to Dental Treatment | CA Smile Dental Clinic",
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
    alternates: {
      canonical: `/treatments/${targetSlug}`,
    },
  };
}

export default function ServiceDetailPage({ params }: ServicePageProps) {
  if (DELETED_DUMMY_TEMPLATE_SLUGS.has(params.slug)) {
    notFound();
  }

  const targetSlug = SERVICE_TO_TREATMENT_MAP[params.slug] || params.slug;
  const treatment = getTreatmentById(targetSlug);
  if (!treatment) {
    notFound();
  }

  permanentRedirect(`/treatments/${targetSlug}`);
}
