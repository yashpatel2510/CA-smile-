import type { Metadata } from "next";
import { Faq } from "@/components/ui/faq";
import { getFaqsStoreData } from "@/lib/faqs-store";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | CA Smile Dental Clinic",
  description:
    "Find answers to frequently asked questions about appointments, painless dental treatments, clear aligners, dental emergencies, and pricing.",
};

export const dynamic = "force-dynamic";

export default function FaqPage() {
  const store = getFaqsStoreData();
  const activeItems = (store.items || [])
    .filter((i) => i.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
    }));

  return (
    <main className="min-h-screen bg-brand-background py-8">
      <Faq
        eyebrow="Patient Knowledge Base"
        title={store.settings?.title || "Frequently Asked Questions"}
        description={
          store.settings?.subtitle ||
          "Find answers to the questions patients ask most about our dental treatments, technology, and scheduling."
        }
        items={activeItems.length > 0 ? activeItems : undefined}
        layout={store.settings?.layout === "centered" ? "stacked" : "split"}
        footer={
          <span>
            {store.settings?.supportText || "Still have questions?"}{" "}
            <a
              href={store.settings?.supportLinkHref || "/contact"}
              className="text-brand-primary font-semibold underline underline-offset-4 hover:no-underline"
            >
              {store.settings?.supportLinkText || "Contact our clinical team"}
            </a>
          </span>
        }
      />
    </main>
  );
}
