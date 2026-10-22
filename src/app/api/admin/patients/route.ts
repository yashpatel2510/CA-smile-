import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import inMemoryStore from "@/lib/in-memory-store";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";

  try {
    const patients = await prisma.patient.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        appointments: {
          orderBy: { startTime: "desc" },
          take: 10,
          include: { service: true },
        },
        whatsappConversations: {
          take: 1,
          orderBy: { lastMessageTimestamp: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = (patients as any[]).map((p: any) => {
      const waConv = p.whatsappConversations?.[0];
      const hasWhatsApp = !!waConv || (p.appointments || []).some((a: any) => a.source === "WHATSAPP");

      return {
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        email: p.email,
        gender: p.gender,
        hasWhatsApp,
        whatsAppConversationId: waConv?.id,
        appointmentCount: (p.appointments || []).length,
        appointments: (p.appointments || []).map((a: any) => ({
          id: a.id,
          startTime: a.startTime.toISOString(),
          endTime: a.endTime.toISOString(),
          status: a.status,
          source: a.source,
          serviceName: a.service?.name || "Consultation",
          preferredDoctor: a.preferredDoctor,
        })),
        createdAt: p.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ patients: formatted });
  } catch (err: any) {
    // In-memory fallback
    const appts = inMemoryStore.getAppointments();
    const patientMap = new Map<string, any>();

    for (const a of appts) {
      const phone = a.patient.phone || "Unknown";
      if (!patientMap.has(phone)) {
        patientMap.set(phone, {
          id: `p_${phone}`,
          name: `${a.patient.firstName} ${a.patient.lastName}`,
          firstName: a.patient.firstName,
          lastName: a.patient.lastName,
          phone,
          email: a.patient.email,
          hasWhatsApp: a.source === "WHATSAPP",
          appointmentCount: 0,
          appointments: [],
          createdAt: a.createdAt,
        });
      }

      const p = patientMap.get(phone);
      p.appointmentCount += 1;
      p.appointments.push({
        id: a.id,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        source: a.source,
        serviceName: a.service?.name || "Consultation",
        preferredDoctor: a.preferredDoctor,
      });
    }

    let list = Array.from(patientMap.values());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q));
    }

    return NextResponse.json({ patients: list });
  }
}
