import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  blogPosts,
  getPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
} from "@/lib/blog";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { BlogDetailView } from "@/components/public/blog-detail-view";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Article Not Found | CA Smile Dental Journal",
    };
  }

  return {
    title: `${post.title} | CA Smile Dental Clinic Bilimora`,
    description: post.summary,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `/blog/${post.slug}`,
      type: "article",
      images: [
        {
          url: post.image,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
  };
}

export const dynamic = "force-dynamic";

export default function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const related = getRelatedPosts(post.slug, 3);
  const { prev: prevPost, next: nextPost } = getAdjacentPosts(post.slug);

  // Article JSON-LD Schema for rich search indexing
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: post.title,
    description: post.summary,
    image: post.image,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "DentalClinic",
      name: "CA Smile Dental Clinic",
      url: "https://casmiledental.com",
    },
    about: {
      "@type": "MedicalCondition",
      name: post.category,
    },
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="py-8 sm:py-12 lg:py-16 bg-[#fafafa] dark:bg-[#09090b] min-h-screen transition-colors">
        <SectionWrapper containerSize="narrow" className="py-0 sm:py-0 lg:py-0">
          <BlogDetailView
            post={post}
            related={related}
            prevPost={prevPost}
            nextPost={nextPost}
          />
        </SectionWrapper>
      </main>
    </>
  );
}
