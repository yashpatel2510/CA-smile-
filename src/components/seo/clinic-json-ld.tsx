import React from "react";
import { clinicalServices } from "@/data/services-data";

export function ClinicJsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("vercel.app")
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
      : "https://www.casmiledentalclinic.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": ["DentalClinic", "Dentist", "LocalBusiness"],
    "@id": `${baseUrl}/#clinic`,
    name: "CA Smile Dental Clinic",
    alternateName: "CA Smile Multispeciality Dental Clinic",
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    image: `${baseUrl}/images/ca-smile-clinic-building.jpg`,
    priceRange: "₹₹",
    hasMap:
      "https://www.google.com/maps/place/CA+Smile+Multispeciality+Dental+Clinic/data=!4m2!3m1!1s0x0:0x3a288255f324c8de?sa=X&ved=1t:2428&ictx=111",
    description:
      "Looking for a dentist in Bilimora? Visit CA Smile Dental Clinic for dental implants, root canal treatment, braces, smile designing and comprehensive dental care. Book an appointment today.",
    founder: {
      "@type": "Person",
      name: "Dr. Deep Patel",
      jobTitle: "Chief Dental Surgeon & Clinic Founder",
      alumniOf: "BDS (Bachelor of Dental Surgery)",
    },
    telephone: "+91 72260 98074",
    email: "casmileatbilimora@gmail.com",
    currenciesAccepted: "INR",
    paymentAccepted:
      "Cash, UPI, Credit Card, Debit Card, Net Banking",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank/ Krishna Dairy, Kutchhi Friends Society",
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
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "20:00",
      },
    ],
    medicalSpecialty: [
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
