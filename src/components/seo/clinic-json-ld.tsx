import React from "react";
import { clinicalServices } from "@/data/services-data";

export function ClinicJsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://healthsphere.example.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": `${baseUrl}/#clinic`,
    name: "HealthSphere Medical Clinic",
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    image: `${baseUrl}/og-clinic.jpg`,
    description:
      "Comprehensive multi-specialty medical clinic providing general practice, preventive cardiology, pediatrics, and dental care with same-day scheduling.",
    telephone: "+1-800-555-2546",
    email: "contact@healthsphere.example.com",
    currenciesAccepted: "USD",
    paymentAccepted:
      "Cash, Credit Card, Health Savings Account (HSA), Flexible Spending Account (FSA)",
    address: {
      "@type": "PostalAddress",
      streetAddress: "742 Evergreen Medical Way, Suite 400",
      addressLocality: "Metro City",
      addressRegion: "NY",
      postalCode: "10001",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "40.7505",
      longitude: "-73.9934",
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
