import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Setup | Admin Panel",
  description: "Everything that configures the clinic, in one place.",
};

interface SetupItem {
  title: string;
  href: string;
  badge?: string;
}

interface SetupSection {
  category: string;
  items: SetupItem[];
}

const setupSections: SetupSection[] = [
  {
    category: "CLINIC",
    items: [
      {
        title: "Clinic Setup",
        href: "/admin/setup/clinic-setup",
      },
      {
        title: "Document Branding & Letterhead Calibration",
        href: "/admin/setup/branding",
        badge: "Dual-Paper",
      },
      {
        title: "Patient Numbering",
        href: "/admin/setup/patient-numbering",
      },
      {
        title: "Branches",
        href: "/admin/setup/branches",
      },
      {
        title: "Services & Pricing",
        href: "/admin/setup/services",
      },
      {
        title: "Fee Schedule",
        href: "/admin/setup/fee-schedule",
      },
    ],
  },
  {
    category: "TEAM & ACCESS",
    items: [
      {
        title: "Roles & Permissions",
        href: "/admin/setup/roles-permissions",
      },
      {
        title: "Doctors",
        href: "/admin/setup/doctors",
      },
    ],
  },
];

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
          Setup
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Everything that configures the clinic, in one place.
        </p>
      </div>

      {/* Sections List */}
      <div className="space-y-8">
        {setupSections.map((section) => (
          <div key={section.category}>
            {/* Category Header */}
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              {section.category}
            </h2>

            {/* Grouped Options Box */}
            <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-xs transition-colors">
              <div className="divide-y divide-brand-border/70">
                {section.items.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center justify-between px-5 py-4 text-sm font-medium text-brand-text transition-colors hover:bg-brand-background/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold">{item.title}</span>
                      {item.badge && (
                        <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-500/20">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-brand-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-brand-text" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
