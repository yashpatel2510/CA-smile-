import { BlogPost } from "@/data/blog-posts";
import {
  getAllPosts,
  getPostBySlug,
  getAllCategories,
  getBlogSectionConfig,
  type BlogSectionConfig,
  type BlogStoreData,
} from "@/lib/blog-store";

export {
  getAllPosts,
  getPostBySlug,
  getAllCategories,
  getBlogSectionConfig,
  type BlogPost,
  type BlogSectionConfig,
  type BlogStoreData,
};

// Also export blogPosts array getter for any direct references
export const blogPosts = new Proxy([] as BlogPost[], {
  get(target, prop, receiver) {
    const posts = getAllPosts();
    return Reflect.get(posts, prop, receiver);
  },
});

export function getRelatedPosts(currentSlug: string, count = 3): BlogPost[] {
  const current = getPostBySlug(currentSlug);
  const all = getAllPosts();
  if (!current) return all.slice(0, count);
  // Match same category first, then fallback to others
  const sameCat = all.filter((p) => p.slug !== currentSlug && p.category === current.category);
  const others = all.filter((p) => p.slug !== currentSlug && p.category !== current.category);
  return [...sameCat, ...others].slice(0, count);
}

export function getAdjacentPosts(currentSlug: string): { prev?: BlogPost; next?: BlogPost } {
  const all = getAllPosts();
  const index = all.findIndex((p) => p.slug === currentSlug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? all[index - 1] : undefined,
    next: index < all.length - 1 ? all[index + 1] : undefined,
  };
}
