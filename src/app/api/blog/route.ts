import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getBlogData,
  addBlogPost,
  updateBlogPost,
  deleteBlogPost,
  addCategory,
  updateCategory,
  deleteCategory,
  updateBlogSectionConfig,
} from "@/lib/blog-store";

export async function GET() {
  try {
    const data = getBlogData();
    return NextResponse.json({
      success: true,
      posts: data.posts,
      categories: data.categories,
      config: data.config,
    });
  } catch (err: any) {
    console.error("Error fetching blog data:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load blog data." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Allow admin changes (and gracefully allow local dev management if needed)
    if (session?.user && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Admin privileges required to manage blog content.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const action = body.action || "create-post";

    switch (action) {
      case "create-post": {
        const result = addBlogPost(body.post || body);
        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: "Article successfully created.",
          post: result.post,
          data: getBlogData(),
        });
      }

      case "update-post": {
        const slug = body.slug || body.post?.slug;
        if (!slug) {
          return NextResponse.json({ success: false, error: "Article slug is required." }, { status: 400 });
        }
        const result = updateBlogPost(slug, body.post || body.updates || body);
        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: "Article successfully updated.",
          post: result.post,
          data: getBlogData(),
        });
      }

      case "delete-post": {
        const slug = body.slug;
        if (!slug) {
          return NextResponse.json({ success: false, error: "Article slug is required." }, { status: 400 });
        }
        const result = deleteBlogPost(slug);
        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: "Article successfully deleted.",
          data: getBlogData(),
        });
      }

      case "add-category": {
        const name = body.name || body.category;
        const result = addCategory(name);
        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: `Category "${name}" added successfully.`,
          categories: result.categories,
          data: getBlogData(),
        });
      }

      case "update-category": {
        const oldName = body.oldName;
        const newName = body.newName;
        if (!oldName || !newName) {
          return NextResponse.json({ success: false, error: "Both old and new category names are required." }, { status: 400 });
        }
        const result = updateCategory(oldName, newName);
        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: `Category updated to "${newName}".`,
          categories: result.categories,
          data: getBlogData(),
        });
      }

      case "delete-category": {
        const name = body.name || body.category;
        const fallback = body.fallbackCategory || "General Dentistry";
        if (!name) {
          return NextResponse.json({ success: false, error: "Category name is required." }, { status: 400 });
        }
        const result = deleteCategory(name, fallback);
        return NextResponse.json({
          success: true,
          message: `Category "${name}" removed.`,
          categories: result.categories,
          data: getBlogData(),
        });
      }

      case "update-config": {
        const configUpdates = body.config || body;
        const result = updateBlogSectionConfig(configUpdates);
        return NextResponse.json({
          success: true,
          message: "Blog section display settings updated successfully.",
          config: result.config,
          data: getBlogData(),
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action "${action}"` }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Error in blog API POST:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process request." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = body.slug;
    if (slug) {
      const result = updateBlogPost(slug, body.updates || body);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "Article updated successfully.",
        post: result.post,
        data: getBlogData(),
      });
    }

    if (body.config) {
      const result = updateBlogSectionConfig(body.config);
      return NextResponse.json({
        success: true,
        message: "Blog configuration updated.",
        config: result.config,
        data: getBlogData(),
      });
    }

    return NextResponse.json({ success: false, error: "Missing slug or config in payload." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug query param required." }, { status: 400 });
    }
    const result = deleteBlogPost(slug);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: "Article deleted successfully.",
      data: getBlogData(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
