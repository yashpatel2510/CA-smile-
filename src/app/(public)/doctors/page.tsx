import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Calendar,
  GraduationCap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { BookNowButton } from "@/components/ui/book-now-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Our Dental Doctors & Specialists | CA Smile Dental Clinic Bilimora",
  description:
    "Meet Dr. Deep A Patel (BDS, Chief Dental Surgeon) and our specialist dental team at CA Smile Dental Clinic in Bilimora, Gujarat.",
  alternates: {
    canonical: "/doctors",
  },
  openGraph: {
    title: "Our Dental Doctors & Specialists | CA Smile Dental Clinic",
    description:
      "Meet Dr. Deep A Patel (BDS, Chief Dental Surgeon) and our team in Bilimora, Gujarat.",
    url: "/doctors",
  },
};

export default function DoctorsPage() {
  const doctors = [
    {
      name: "Dr. Deep A Patel, BDS",
      role: "Chief Dental Surgeon & Founder",
      credentials: "BDS (Bachelor of Dental Surgery)",
      specialty:
        "Single-Visit Painless Root Canal, Dental Implants, Digital Smile Design",
      availability: "Mon–Sun: 9:00 AM – 8:00 PM",
      bio: "Founder and Chief Dental Surgeon at CA Smile Dental Clinic. Dr. Deep Patel is dedicated to gentle, high-precision dental healthcare using low-radiation digital radiography, rotary endodontics, and computer smile planning.",
    },
    {
      name: "Consultant Orthodontist",
      role: "Visiting Specialist in Invisible Aligners & Braces",
      credentials: "MDS (Orthodontics & Dentofacial Orthopedics)",
      specialty:
        "Clear Aligners, Ceramic Braces & Bite Correction for Teens & Adults",
      availability: "By Prior Appointment / Weekly Aligner Clinics",
      bio: "Focuses on digital orthodontic smile alignment, invisible clear aligners, and comprehensive bite harmony using 3D treatment planning.",
    },
    {
      name: "Consultant Oral & Maxillofacial Surgeon",
      role: "Visiting Specialist in Surgical Dentistry",
      credentials: "MDS (Oral & Maxillofacial Surgery)",
      specialty:
        "Impacted Wisdom Tooth Removal, Bone Grafting & Surgical Implantology",
      availability: "By Prior Appointment / Scheduled Surgical Sessions",
      bio: "Specializes in painless surgical extraction of difficult impacted third molars, bone regeneration, and advanced pre-implant procedures.",
    },
    {
      name: "Consultant Periodontist",
      role: "Visiting Specialist in Gum Health & Implantology",
      credentials: "MDS (Periodontics & Oral Implantology)",
      specialty:
        "Laser Gum Treatments, Periodontal Flap Surgery & Cosmetic Gum Contouring",
      availability: "By Prior Appointment",
      bio: "Expert in treating advanced gum disease, stabilizing loose teeth, and performing aesthetic gum depigmentation and contouring.",
    },
  ];

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("127.0.0.1") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("vercel.app")
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
      : "https://www.casmiledentalclinic.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Person", "Dentist"],
        "@id": `${baseUrl}/#dr-deep-patel`,
        name: "Dr. Deep A Patel",
        jobTitle: "Chief Dental Surgeon & Founder",
        alumniOf: "BDS (Bachelor of Dental Surgery)",
        medicalSpecialty: "https://schema.org/Dentistry",
        url: `${baseUrl}/doctors`,
        telephone: "+91 72260 98074",
        worksFor: {
          "@type": ["Dentist", "DentalClinic", "LocalBusiness"],
          "@id": `${baseUrl}/#clinic`,
          name: "CA Smile Dental Clinic",
          url: baseUrl,
          telephone: "+91 72260 98074",
          address: {
            "@type": "PostalAddress",
            streetAddress: "1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank/ Krishna Dairy, Kutchhi Friends Society",
            addressLocality: "Bilimora",
            addressRegion: "Gujarat",
            postalCode: "396321",
            addressCountry: "IN",
          },
        },
        knowsAbout: [
          "Single-Visit Painless Root Canal",
          "Dental Implants",
          "Digital Smile Design",
          "Preventive Dentistry",
          "Cosmetic Dentistry",
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/doctors#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Doctors & Clinical Specialists",
            item: `${baseUrl}/doctors`,
          },
        ],
      },
    ],
  };

  return (
    <div className="py-12 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <Badge variant="default" className="flex w-fit items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Dental Clinical Faculty</span>
          </Badge>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl">
            Meet Our Dental Specialists
          </h1>
          <p className="text-base text-brand-muted">
            Led by Dr. Deep A Patel, our clinical dental team brings advanced
            diagnostic expertise, gentle chairside care, and specialized dental
            medicine to patients in Bilimora, Gujarat.
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
                    {doctor.name.includes("Dr. Deep")
                      ? "DP"
                      : doctor.name.charAt(0) || "D"}
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-heading text-xl font-bold text-brand-text">
                      {doctor.name}
                    </h2>
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
                    <span>In-Clinic Schedule:</span>
                    <span className="font-normal text-brand-muted">
                      {doctor.availability}
                    </span>
                  </div>
                </div>

                <div className="border-brand-border/60 flex items-center justify-between border-t pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                    <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                    <span>Accepting Appointments</span>
                  </div>
                  <BookNowButton
                    href={`/contact?doctor=${encodeURIComponent(doctor.name)}`}
                    text="Book Consultation"
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
