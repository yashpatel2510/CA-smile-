import { redirect } from "next/navigation";

export default function AdminTreatmentsRedirectPage() {
  redirect("/admin/services");
}
