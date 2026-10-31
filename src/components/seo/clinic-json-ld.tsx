import React from "react";
import { clinicalServices } from "@/data/services-data";

export function ClinicJsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://casmilebilimora.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "DentalClinic",
    "@id": `${baseUrl}/#clinic`,
    name: "CA Smile Dental Clinic",
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    image: `${baseUrl}/images/ca-smile-clinic-building.jpg`,
    description:
      "Modern multispeciality dental clinic in Bilimora providing single-visit painless root canal, digital smile designing, dental implants, and clear aligners.",
    telephone: "+91 72260 98074",
    email: "casmileatbilimora@gmail.com",
    currenciesAccepted: "INR",
    paymentAccepted:
      "Cash, UPI, Credit Card, Debit Card, Net Banking",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1st Floor, Labdhi Arcade, Above HDFC Bank, Convent Rd",
      addressLocality: "Bilimora",
      addressRegion: "Gujarat",
      postalCode: "396321",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "20.7636",
      longitude: "72.9680",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "16:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "10:00",
        closes: "14:00",
      },
    ],
    medicalSpecialty: [
      "https://schema.org/PrimaryCare",
      "https://schema.org/Cardiovascular",
      "https://schema.org/Pediatric",
      "https://schema.org/Dentistry",
    ],
    availableService: clinicalServices.map((svc) => ({
      "@type": "MedicalProcedure",
      name: svc.name,
      description: svc.summary,
      url: `${baseUrl}/services/${svc.slug}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
