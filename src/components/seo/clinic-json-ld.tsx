import React from "react";
import { getTreatmentsStoreData } from "@/lib/treatments-store";

export function ClinicJsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("127.0.0.1") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("vercel.app")
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
      : "https://www.casmiledentalclinic.com";

  const treatmentsData = getTreatmentsStoreData();
  const allProcedures = (treatmentsData.treatments || []).filter((t) => t.isActive);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      // 1. WebSite Schema
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "CA Smile Dental Clinic Bilimora",
        alternateName: "CA Smile Dental Clinic",
        description:
          "Official website of CA Smile Dental Clinic by Dr. Deep Patel in Bilimora, Gujarat. Painless root canals, dental implants, teeth whitening, invisible braces and smile design.",
        inLanguage: "en-IN",
        publisher: {
          "@id": `${baseUrl}/#clinic`,
        },
      },
      // 2. Dentist & LocalBusiness Schema
      {
        "@type": ["Dentist", "DentalClinic", "LocalBusiness"],
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
          "Looking for the best dentist in Bilimora? Visit CA Smile Dental Clinic by Dr. Deep Patel for painless root canal treatment, dental implants, teeth whitening, invisible braces & smile designing.",
        telephone: "+91 72260 98074",
        email: "casmileatbilimora@gmail.com",
        currenciesAccepted: "INR",
        paymentAccepted: "Cash, UPI, Credit Card, Debit Card, Net Banking",
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
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5.0",
          reviewCount: "500",
          bestRating: "5",
          worstRating: "1",
        },
        founder: {
          "@id": `${baseUrl}/#dr-deep-patel`,
        },
        employee: [
          {
            "@id": `${baseUrl}/#dr-deep-patel`,
          },
        ],
        areaServed: [
          { "@type": "City", name: "Bilimora" },
          { "@type": "City", name: "Navsari" },
          { "@type": "City", name: "Gandevi" },
          { "@type": "City", name: "Chikhli" },
          { "@type": "City", name: "Valsad" },
          { "@type": "AdministrativeArea", name: "Gujarat" },
        ],
        sameAs: [
          "https://www.instagram.com/ca_smile_bilimora?psln=c3Rhcmk3aHE4bjBw",
          "https://www.google.com/maps/place/CA+Smile+Multispeciality+Dental+Clinic/data=!4m2!3m1!1s0x0:0x3a288255f324c8de?sa=X&ved=1t:2428&ictx=111",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Dental Services & Diagnostics",
          itemListElement: allProcedures.map((item, idx) => ({
            "@type": "OfferCatalog",
            name: item.title,
            position: idx + 1,
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": ["Service", "MedicalProcedure"],
                  name: item.title,
                  description: item.whatItIs || item.paragraphs?.[0] || item.title,
                  url: `${baseUrl}/treatments/${item.id}`,
                  provider: { "@id": `${baseUrl}/#clinic` },
                },
              },
            ],
          })),
        },
      },
      // 3. Person Schema for Dr. Deep Patel
      {
        "@type": ["Person", "Dentist"],
        "@id": `${baseUrl}/#dr-deep-patel`,
        name: "Dr. Deep Patel",
        jobTitle: "Chief Dental Surgeon & Founder",
        description:
          "Experienced Dental Surgeon specializing in Single-Visit Painless Root Canal Therapy, Dental Implants, Digital Smile Design, and Restorative Dentistry in Bilimora, Gujarat.",
        alumniOf: "BDS (Bachelor of Dental Surgery)",
        medicalSpecialty: "https://schema.org/Dentistry",
        worksFor: {
          "@id": `${baseUrl}/#clinic`,
        },
        knowsAbout: [
          "Single-Visit Painless Root Canal",
          "Dental Implants",
          "Digital Smile Design",
          "Orthodontics & Clear Aligners",
          "Teeth Whitening",
          "Porcelain Veneers",
          "Restorative Dentistry",
          "Preventive Dental Care",
        ],
        url: `${baseUrl}/doctors`,
        telephone: "+91 72260 98074",
        address: {
          "@type": "PostalAddress",
          streetAddress:
            "1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank/ Krishna Dairy, Kutchhi Friends Society",
          addressLocality: "Bilimora",
          addressRegion: "Gujarat",
          postalCode: "396321",
          addressCountry: "IN",
        },
      },
      // 4. BreadcrumbList Schema for Home
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
