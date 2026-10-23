import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function BookAppointmentPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => {
      if (typeof v === "string") {
        params.set(k, v);
      } else if (Array.isArray(v) && v.length > 0) {
        params.set(k, v[0]);
      }
    });
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  redirect(`/contact${query}`);
}
