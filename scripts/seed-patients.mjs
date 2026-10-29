import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding realistic dental clinic patients and bookings...");

  let clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        name: "SmileCraft Dental Studio",
        slug: "smilecraft-dental",
        themeKey: "teal-serenity",
      },
    });
  }

  // Get or create services
  let services = await prisma.service.findMany({ where: { clinicId: clinic.id } });
  if (services.length === 0) {
    const s1 = await prisma.service.create({
      data: {
        clinicId: clinic.id,
        name: "General Dental Consultation & Checkup",
        price: 50.0,
        durationMinutes: 30,
        category: "Preventive",
      },
    });
    const s2 = await prisma.service.create({
      data: {
        clinicId: clinic.id,
        name: "Root Canal Treatment (RCT)",
        price: 250.0,
        durationMinutes: 60,
        category: "Endodontics",
      },
    });
    const s3 = await prisma.service.create({
      data: {
        clinicId: clinic.id,
        name: "Teeth Whitening & Laser Cleaning",
        price: 180.0,
        durationMinutes: 45,
        category: "Cosmetic",
      },
    });
    const s4 = await prisma.service.create({
      data: {
        clinicId: clinic.id,
        name: "Orthodontic Aligners & Braces Consult",
        price: 120.0,
        durationMinutes: 40,
        category: "Orthodontics",
      },
    });
    services = [s1, s2, s3, s4];
  }

  const samplePatients = [
    {
      firstName: "Aarav",
      lastName: "Mehta",
      phone: "+91 98251 44210",
      email: "aarav.mehta@gmail.com",
      insurance: "Delta Dental",
      medicalNotes: "Insurance: Delta Dental | Pre-existing sensitivity in upper right molar",
      serviceName: "Root Canal Treatment (RCT)",
      doctor: "Dr. Sankar (Chief Dental Surgeon)",
      paidAmount: 250.0,
      totalAmount: 250.0,
      status: "CONFIRMED",
      source: "WHATSAPP",
    },
    {
      firstName: "Priya",
      lastName: "Sharma",
      phone: "+91 97123 88412",
      email: "priya.sharma@outlook.com",
      insurance: "MetLife Dental",
      medicalNotes: "Insurance: MetLife Dental | Routine 6-month cleaning",
      serviceName: "Teeth Whitening & Laser Cleaning",
      doctor: "Dr. Rohan Shah (Orthodontics)",
      paidAmount: 180.0,
      totalAmount: 180.0,
      status: "COMPLETED",
      source: "WEBSITE",
    },
    {
      firstName: "Rohan",
      lastName: "Patel",
      phone: "+91 99042 11985",
      email: "rohan.p@yahoo.com",
      insurance: "Cigna Health",
      medicalNotes: "Insurance: Cigna Health | Ortho alignment inquiry for clear aligners",
      serviceName: "Orthodontic Aligners & Braces Consult",
      doctor: "Dr. Rohan Shah (Orthodontics)",
      paidAmount: 120.0,
      totalAmount: 120.0,
      status: "CONFIRMED",
      source: "WHATSAPP",
    },
    {
      firstName: "Ananya",
      lastName: "Desai",
      phone: "+91 98980 55123",
      email: "ananya.desai@gmail.com",
      insurance: "Self Pay / Cash",
      medicalNotes: "Self pay patient | First time dental checkup",
      serviceName: "General Dental Consultation & Checkup",
      doctor: "Dr. Sankar (Chief Dental Surgeon)",
      paidAmount: 50.0,
      totalAmount: 50.0,
      status: "CONFIRMED",
      source: "WEB_FORM",
    },
    {
      firstName: "Kavita",
      lastName: "Nair",
      phone: "+91 98240 77651",
      email: "kavita.nair@hotmail.com",
      insurance: "Aetna Dental",
      medicalNotes: "Insurance: Aetna Dental | Follow-up filling restoration",
      serviceName: "General Dental Consultation & Checkup",
      doctor: "Dr. Sankar (Chief Dental Surgeon)",
      paidAmount: 100.0,
      totalAmount: 100.0,
      status: "CHECKED_IN",
      source: "PHONE",
    },
    {
      firstName: "Vikram",
      lastName: "Singhania",
      phone: "+91 94280 33219",
      email: "vikram.singh@gmail.com",
      insurance: "Self Pay / Cash",
      medicalNotes: "Deep scaling and whitening aesthetics",
      serviceName: "Teeth Whitening & Laser Cleaning",
      doctor: "Dr. New Dental Specialist",
      paidAmount: 180.0,
      totalAmount: 180.0,
      status: "PENDING",
      source: "WHATSAPP",
    },
    {
      firstName: "Sneha",
      lastName: "Joshi",
      phone: "+91 97234 66102",
      email: "sneha.j@gmail.com",
      insurance: "Delta Dental",
      medicalNotes: "Insurance: Delta Dental | Pediatric checkup for daughter",
      serviceName: "General Dental Consultation & Checkup",
      doctor: "Dr. Sankar (Chief Dental Surgeon)",
      paidAmount: 50.0,
      totalAmount: 50.0,
      status: "CONFIRMED",
      source: "WALK_IN",
    },
  ];

  for (const p of samplePatients) {
    const existing = await prisma.patient.findFirst({
      where: { phone: p.phone },
    });

    if (!existing) {
      const createdPatient = await prisma.patient.create({
        data: {
          clinicId: clinic.id,
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          medicalNotes: p.medicalNotes,
        },
      });

      const srv =
        services.find((s) => s.name === p.serviceName) || services[0];

      const startTime = new Date(Date.now() + Math.floor(Math.random() * 5 + 1) * 86400000);
      const endTime = new Date(startTime.getTime() + 30 * 60000);

      await prisma.appointment.create({
        data: {
          clinicId: clinic.id,
          patientId: createdPatient.id,
          serviceId: srv.id,
          startTime,
          endTime,
          status: p.status,
          source: p.source,
          reason: p.serviceName,
          preferredDoctor: p.doctor,
          paidAmount: p.paidAmount,
          totalAmount: p.totalAmount,
          paymentStatus: "PAID",
          notes: p.medicalNotes,
        },
      });
      console.log(`Created patient & booking for: ${p.firstName} ${p.lastName}`);
    }
  }

  const patientCount = await prisma.patient.count();
  const appointmentCount = await prisma.appointment.count();
  console.log(`Finished! Total Patients: ${patientCount}, Total Appointments: ${appointmentCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
