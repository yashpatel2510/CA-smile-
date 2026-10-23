import Link from "next/link";
import {
  Stethoscope,
  Award,
  Calendar,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookNowButton } from "@/components/ui/book-now-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DoctorsPage() {
  const doctors = [
    {
      name: "Dr. Sarah Vance, MD",
      role: "Chief Medical Officer & Family Medicine",
      credentials: "Harvard Medical School • 14 Years Exp",
      specialty: "Primary Care, Chronic Disease Management",
      availability: "Monday, Wednesday, Friday",
      bio: "Specializing in proactive preventative care, family health, and holistic diagnostic assessment.",
    },
    {
      name: "Dr. Marcus Chen, MD, FACC",
      role: "Lead Cardiologist",
      credentials: "Johns Hopkins University • 18 Years Exp",
      specialty: "Cardiology & Vascular Medicine",
      availability: "Tuesday, Thursday, Saturday",
      bio: "Pioneer in non-invasive cardiovascular diagnostics and hypertensive disease management.",
    },
    {
      name: "Dr. Elena Rostova, MD",
      role: "Pediatric Specialist",
      credentials: "Stanford University School of Medicine • 10 Years Exp",
      specialty: "Pediatrics & Adolescent Care",
      availability: "Monday through Friday",
      bio: "Dedicated to gentle, stress-free clinical care for infants, children, and teenagers.",
    },
    {
      name: "Dr. David Kim, DDS",
      role: "Director of Dental Surgery",
      credentials: "Columbia University Dental Medicine • 12 Years Exp",
      specialty: "Restorative Dentistry & Orthodontics",
      availability: "Tuesday, Wednesday, Saturday",
      bio: "Expert in gentle dental procedures, modern restorative implants, and aesthetic smiles.",
    },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <Badge variant="default">Clinical Faculty</Badge>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl">
            Meet Our Medical Specialists
          </h1>
          <p className="text-base text-brand-muted">
            Our multidisciplinary team of board-certified physicians,
            specialists, and clinical staff are committed to evidence-based
            healthcare.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {doctors.map((doctor, index) => (
            <Card
              key={index}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-clinic bg-brand-primary font-heading text-xl font-bold text-brand-primary-foreground shadow-sm">
                    {doctor.name.split(" ")[1]?.charAt(0) || "D"}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading text-xl font-bold text-brand-text">
                      {doctor.name}
                    </h3>
                    <p className="text-sm font-medium text-brand-primary">
                      {doctor.role}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1 text-xs text-brand-muted">
                      <GraduationCap className="h-3.5 w-3.5 text-brand-primary" />
                      <span>{doctor.credentials}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-brand-muted">
                  {doctor.bio}
                </p>

                <div className="bg-brand-accent/20 border-brand-border/40 space-y-1.5 rounded-clinic border p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-brand-text">
                    <Award className="h-3.5 w-3.5 text-brand-primary" />
                    <span>Specialty Focus:</span>
                    <span className="font-normal text-brand-muted">
                      {doctor.specialty}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-brand-text">
                    <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                    <span>In-Clinic Days:</span>
                    <span className="font-normal text-brand-muted">
                      {doctor.availability}
                    </span>
                  </div>
                </div>

                <div className="border-brand-border/60 flex items-center justify-between border-t pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                    <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                    <span>Accepting New Patients</span>
                  </div>
                  <BookNowButton
                    href={`/contact?doctor=${encodeURIComponent(doctor.name)}`}
                    text="Book Now"
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
