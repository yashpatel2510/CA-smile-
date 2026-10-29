import { redirect } from "next/navigation";

export default function PendingPageRedirect() {
  redirect("/admin/today");
}
