import { redirect } from "next/navigation";

export default function AdminBlogRedirectPage() {
  redirect("/admin/settings?tab=blog");
}
