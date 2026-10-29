import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { ImportClinicDataView } from "@/components/admin/setup/import-clinic-data-view";
import { DentalDocumentBrandingView } from "@/components/admin/setup/dental-document-branding-view";

interface SetupPageConfig {
  title: string;
  category: string;
  description: string;
}

const SETUP_PAGES: Record<string, SetupPageConfig> = {
  "branding": {
    title: "Document Branding & Letterhead Calibration",
    category: "Clinic",
    description: "Millimeter calibration for pre-printed dental pads and digital letterheads.",
  },
  "document-branding": {
    title: "Document Branding & Letterhead Calibration",
    category: "Clinic",
    description: "Millimeter calibration for pre-printed dental pads and digital letterheads.",
  },
  "branches": {
    title: "Branches",
    category: "Clinic",
    description: "Locations, facilities, and branch operational management.",
  },
  "appointment-workflow": {
    title: "Appointment Workflow",
    category: "Clinic",
    description: "Appointment booking rules, workflow stages, and scheduling controls.",
  },
  "team": {
    title: "Team",
    category: "Team & Access",
    description: "Manage clinic staff members, front desk personnel, and roles.",
  },
  "roles-permissions": {
    title: "Roles & Permissions",
    category: "Team & Access",
    description: "User roles, access control levels, and security policies.",
  },
  "doctors": {
    title: "Doctors",
    category: "Team & Access",
    description: "Dentists, specialists, clinical consultation timings, and schedules.",
  },
  "import-clinic-data": {
    title: "Import Clinic Data",
    category: "Data & Migration",
    description: "Bulk import patients, appointments, services, and doctors from CSV or Excel files.",
  },
  "import-data": {
    title: "Import Data",
    category: "Data & Migration",
    description: "Bulk import patients, appointments, services, and doctors from CSV or Excel files.",
  },
  "import": {
    title: "Import Data",
    category: "Data & Migration",
    description: "Bulk import patients, appointments, services, and doctors from CSV or Excel files.",
  },
  "data-import": {
    title: "Import Data",
    category: "Data & Migration",
    description: "Bulk import patients, appointments, services, and doctors from CSV or Excel files.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const pageConfig = SETUP_PAGES[params.slug];
  if (!pageConfig) {
    if (params.slug.includes("import")) {
      return {
        title: "Import Clinic Data | Setup",
        description: "Bulk import patients, appointments, services, and doctors from CSV or Excel files.",
      };
    }
    if (params.slug.includes("branding")) {
      return {
        title: "Document Branding & Letterhead Calibration | Setup",
        description: "Millimeter calibration for pre-printed dental pads and digital letterheads.",
      };
    }
    return { title: "Setup | Admin Panel" };
  }
  return {
    title: `${pageConfig.title} | Setup`,
    description: pageConfig.description,
  };
}

export default function SetupSubPage({
  params,
}: {
  params: { slug: string };
}) {
  // Render DentalDocumentBrandingView for branding slugs
  if (
    params.slug === "branding" ||
    params.slug === "document-branding" ||
    params.slug.includes("branding")
  ) {
    return <DentalDocumentBrandingView />;
  }

  // Always render ImportClinicDataView for any import slug
  if (
    params.slug === "import-clinic-data" ||
    params.slug === "import-data" ||
    params.slug === "import" ||
    params.slug === "data-import" ||
    params.slug.includes("import")
  ) {
    return <ImportClinicDataView />;
  }

  const pageConfig = SETUP_PAGES[params.slug];

  if (!pageConfig) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Top Navigation & Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3">
        <Link
          href="/admin/setup"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-muted transition-colors hover:text-brand-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Setup</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-brand-muted">
          <Link href="/admin/setup" className="hover:text-brand-text">
            Setup
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>{pageConfig.category}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-brand-text">{pageConfig.title}</span>
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
          {pageConfig.title}
        </h1>
        <p className="mt-1 text-sm text-brand-muted">{pageConfig.description}</p>
      </div>

      {/* Blank Workspace Card - No Data Yet */}
      <div className="flex min-h-[460px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border/80 bg-brand-surface/40 p-8 shadow-xs">
        {/* Intentionally blank canvas ready for step-by-step design */}
      </div>
    </div>
  );
}
