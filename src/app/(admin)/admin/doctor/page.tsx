import { Metadata } from "next";
import { CuravertoDoctorConsultationView } from "@/components/admin/doctor/curaverto-doctor-consultation-view";

export const metadata: Metadata = {
  title: "Doctor Section | Admin Panel",
  description: "Live consultation queue for In-Clinic and Counseling patients",
};

export default function AdminDoctorPage() {
  return <CuravertoDoctorConsultationView />;
}

