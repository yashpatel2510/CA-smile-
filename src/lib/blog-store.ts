import fs from "fs";
import path from "path";
import { BlogPost, blogPosts as seedPosts } from "@/data/blog-posts";

export interface BlogSectionConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  badgeText: string;
  enabled: boolean;
  maxFeaturedCount: number;
}

export interface BlogStoreData {
  posts: BlogPost[];
  categories: string[];
  config: BlogSectionConfig;
}

const DEFAULT_BLOG_CONFIG: BlogSectionConfig = {
  sectionTitle: "Latest Dental Health Articles",
  sectionSubtitle:
    "Doctor-authored guides on kids dentistry, invisible aligners, pain-free implants, and everyday oral hygiene.",
  badgeText: "EVIDENCE-BASED DENTAL INSIGHTS",
  enabled: true,
  maxFeaturedCount: 3,
};

const DATA_DIR = path.join(process.cwd(), "src", "data");
const BLOG_JSON_PATH = path.join(DATA_DIR, "blog-posts.json");

// In-memory cache for fast reads across requests
declare global {
  // eslint-disable-next-line no-var
  var __blogDataCache: BlogStoreData | undefined;
}

function getInitialCategories(posts: BlogPost[]): string[] {
  const cats = new Set(posts.map((p) => p.category.trim()).filter(Boolean));
  if (!cats.has("Pediatric Dentistry")) cats.add("Pediatric Dentistry");
  if (!cats.has("Orthodontics")) cats.add("Orthodontics");
  if (!cats.has("Preventive Care")) cats.add("Preventive Care");
  if (!cats.has("Cosmetic Dentistry")) cats.add("Cosmetic Dentistry");
  if (!cats.has("Restorative Dentistry")) cats.add("Restorative Dentistry");
  if (!cats.has("Oral-Systemic Health")) cats.add("Oral-Systemic Health");
  return Array.from(cats);
}

export function getBlogData(): BlogStoreData {
  try {
    if (fs.existsSync(BLOG_JSON_PATH)) {
      const raw = fs.readFileSync(BLOG_JSON_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.posts)) {
        const storeData: BlogStoreData = {
          posts: parsed.posts,
          categories: Array.isArray(parsed.categories) && parsed.categories.length > 0
            ? parsed.categories
            : getInitialCategories(parsed.posts),
          config: {
            ...DEFAULT_BLOG_CONFIG,
            ...(parsed.config || {}),
          },
        };
        global.__blogDataCache = storeData;
        return storeData;
      }
    }
  } catch (err) {
    console.warn("Could not read blog-posts.json, falling back to seed/cache:", err);
  }

  if (global.__blogDataCache) {
    return global.__blogDataCache;
  }

  // First time initialization: populate from seedPosts
  const initialData: BlogStoreData = {
    posts: [...seedPosts],
    categories: getInitialCategories(seedPosts),
    config: DEFAULT_BLOG_CONFIG,
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BLOG_JSON_PATH, JSON.stringify(initialData, null, 2), "utf-8");
  } catch (writeErr) {
    console.error("Could not write initial blog-posts.json:", writeErr);
  }

  global.__blogDataCache = initialData;
  return initialData;
}

function persistBlogData(data: BlogStoreData): boolean {
  try {
    global.__blogDataCache = data;
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BLOG_JSON_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to persist blog data to disk:", err);
    return false;
  }
}

export function getAllPosts(): BlogPost[] {
  return getBlogData().posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  return getBlogData().categories;
}

export function getBlogSectionConfig(): BlogSectionConfig {
  return getBlogData().config;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Persists an uploaded base64 image into /public/images/blog/
 */
export function persistBase64BlogImage(dataUri?: string, slug = "blog"): string | undefined {
  if (!dataUri || !dataUri.startsWith("data:image/")) return dataUri;
  try {
    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return dataUri;
    const ext = matches[1].replace("+xml", "") || "jpg";
    const buffer = Buffer.from(matches[2], "base64");
    const uploadDir = path.join(process.cwd(), "public", "images", "blog");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const cleanSlug = slugify(slug).slice(0, 30) || "article";
    const fileName = `${cleanSlug}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return `/images/blog/${fileName}`;
  } catch (err) {
    console.error("Failed to persist base64 blog image:", err);
    return dataUri;
  }
}

/**
 * Adds a new blog post
 */
export function addBlogPost(post: Partial<BlogPost>): { success: boolean; post?: BlogPost; error?: string } {
  const data = getBlogData();
  const title = (post.title || "").trim();
  if (!title) {
    return { success: false, error: "Blog title is required." };
  }

  let slug = slugify(post.slug || title);
  if (!slug) {
    slug = `article-${Date.now()}`;
  }

  // Ensure unique slug
  let uniqueSlug = slug;
  let counter = 1;
  while (data.posts.some((p) => p.slug === uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  let image = post.image || "/images/treatments/children-dentistry.jpg";
  if (image.startsWith("data:image/")) {
    image = persistBase64BlogImage(image, uniqueSlug) || image;
  }

  const category = (post.category || "General Dentistry").trim();

  // If category is not in list, add it
  if (!data.categories.includes(category)) {
    data.categories.push(category);
  }

  const newPost: BlogPost = {
    slug: uniqueSlug,
    title,
    summary: (post.summary || "").trim() || "Expert dental health guidance from CA Smile Clinic specialists.",
    publishedAt: post.publishedAt || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    readTime: post.readTime || "5 min read",
    category,
    image,
    featured: Boolean(post.featured),
    author: {
      name: post.author?.name || "Dr. Deep, MDS",
      role: post.author?.role || "Dental Health Specialist",
      credentials: post.author?.credentials || "CA Smile Dental Clinic • Bilimora",
      avatar: post.author?.avatar,
    },
    tags: Array.isArray(post.tags) && post.tags.length > 0 ? post.tags : [category, "Dental Health"],
    content: Array.isArray(post.content) && post.content.length > 0
      ? post.content
      : [
          (post.summary || "Comprehensive clinical guidance from the board-certified specialists at CA Smile Dental Clinic."),
          "Regular oral health checkups and preventive cleanings ensure long-term dental longevity. Contact our Bilimora clinic for personal consultation.",
        ],
  };

  // Add to top of posts list
  data.posts.unshift(newPost);
  persistBlogData(data);

  return { success: true, post: newPost };
}

/**
 * Updates an existing blog post
 */
export function updateBlogPost(
  currentSlug: string,
  updates: Partial<BlogPost>
): { success: boolean; post?: BlogPost; error?: string } {
  const data = getBlogData();
  const index = data.posts.findIndex((p) => p.slug === currentSlug);
  if (index === -1) {
    return { success: false, error: "Blog post not found." };
  }

  const existing = data.posts[index];
  let targetSlug = existing.slug;

  if (updates.slug && updates.slug !== existing.slug) {
    const desiredSlug = slugify(updates.slug);
    // Don't allow renaming to another existing slug
    if (desiredSlug !== existing.slug && data.posts.some((p) => p.slug === desiredSlug)) {
      return { success: false, error: "An article with this slug already exists." };
    }
    targetSlug = desiredSlug;
  }

  let image = updates.image || existing.image;
  if (image && image.startsWith("data:image/")) {
    image = persistBase64BlogImage(image, targetSlug) || image;
  }

  const category = (updates.category || existing.category).trim();
  if (!data.categories.includes(category)) {
    data.categories.push(category);
  }

  const updatedPost: BlogPost = {
    ...existing,
    ...updates,
    slug: targetSlug,
    category,
    image,
    author: {
      ...existing.author,
      ...(updates.author || {}),
    },
    tags: Array.isArray(updates.tags) ? updates.tags : existing.tags,
    content: Array.isArray(updates.content) ? updates.content : existing.content,
  };

  data.posts[index] = updatedPost;
  persistBlogData(data);

  return { success: true, post: updatedPost };
}

/**
 * Deletes a blog post
 */
export function deleteBlogPost(slug: string): { success: boolean; error?: string } {
  const data = getBlogData();
  const initialCount = data.posts.length;
  data.posts = data.posts.filter((p) => p.slug !== slug);

  if (data.posts.length === initialCount) {
    return { success: false, error: "Article not found or already deleted." };
  }

  persistBlogData(data);
  return { success: true };
}

/**
 * Adds a new category
 */
export function addCategory(name: string): { success: boolean; categories: string[]; error?: string } {
  const data = getBlogData();
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, categories: data.categories, error: "Category name cannot be empty." };
  }

  const exists = data.categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exists) {
    return { success: false, categories: data.categories, error: "Category already exists." };
  }

  data.categories.push(trimmed);
  persistBlogData(data);
  return { success: true, categories: data.categories };
}

/**
 * Renames a category across category list and existing blog posts
 */
export function updateCategory(oldName: string, newName: string): { success: boolean; categories: string[]; error?: string } {
  const data = getBlogData();
  const trimmedNew = newName.trim();
  if (!trimmedNew) {
    return { success: false, categories: data.categories, error: "New category name cannot be empty." };
  }

  const catIndex = data.categories.findIndex((c) => c.toLowerCase() === oldName.trim().toLowerCase());
  if (catIndex === -1) {
    return { success: false, categories: data.categories, error: "Category not found." };
  }

  data.categories[catIndex] = trimmedNew;

  // Update existing posts that use this category
  data.posts.forEach((post) => {
    if (post.category.toLowerCase() === oldName.trim().toLowerCase()) {
      post.category = trimmedNew;
    }
  });

  persistBlogData(data);
  return { success: true, categories: data.categories };
}

/**
 * Deletes a category and migrates or untags affected posts
 */
export function deleteCategory(categoryName: string, fallbackCategory = "General Dentistry"): { success: boolean; categories: string[]; error?: string } {
  const data = getBlogData();
  const target = categoryName.trim().toLowerCase();

  data.categories = data.categories.filter((c) => c.toLowerCase() !== target);

  // If fallback is not in categories and needed, add it
  if (!data.categories.some((c) => c.toLowerCase() === fallbackCategory.toLowerCase())) {
    data.categories.push(fallbackCategory);
  }

  // Migrate affected posts to fallback
  data.posts.forEach((post) => {
    if (post.category.toLowerCase() === target) {
      post.category = fallbackCategory;
    }
  });

  persistBlogData(data);
  return { success: true, categories: data.categories };
}

/**
 * Updates homepage blog section configuration
 */
export function updateBlogSectionConfig(partial: Partial<BlogSectionConfig>): { success: boolean; config: BlogSectionConfig } {
  const data = getBlogData();
  data.config = {
    ...data.config,
    ...partial,
  };
  persistBlogData(data);
  return { success: true, config: data.config };
}
