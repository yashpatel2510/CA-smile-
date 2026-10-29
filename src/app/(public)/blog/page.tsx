import type { Metadata } from "next";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { BlogShowcaseView } from "@/components/public/blog-showcase-view";
import { getAllPosts, getAllCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Dental Health Blog & Expert Insights | CA Smile Dental Clinic Bilimora",
  description:
    "Evidence-based dental care guidance, pediatric dentistry, clear aligners, dental implants, and preventive wellness written directly by board-certified dental specialists in Bilimora.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "CA Smile Dental Journal - Evidence-Based Oral Health Guides & Articles",
    description:
      "Actionable dental guides on gentle kids dentistry, invisible aligners, teeth whitening, and periodontal wellness.",
    url: "/blog",
  },
};

export const dynamic = "force-dynamic";

export default function BlogListPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <main className="py-8 sm:py-12 lg:py-16 bg-[#fafafa] dark:bg-[#09090b] min-h-screen transition-colors">
      <SectionWrapper containerSize="default" className="py-0 sm:py-0 lg:py-0">
        <BlogShowcaseView posts={posts} categories={categories} />
      </SectionWrapper>
    </main>
  );
}
