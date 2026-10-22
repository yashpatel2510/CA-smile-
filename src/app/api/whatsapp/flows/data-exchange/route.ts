import { NextRequest, NextResponse } from "next/server";
import { decryptFlowRequest, encryptFlowResponse } from "@/lib/whatsapp/flow-crypto";
import { getAvailableTimeSlots } from "@/lib/whatsapp/availability-service";
import { getWhatsAppSettings } from "@/lib/whatsapp/settings-store";
import { FlowDataExchangeRequest, FlowDataExchangeResponse } from "@/lib/whatsapp/types";

/**
 * POST /api/whatsapp/flows/data-exchange
 * Meta WhatsApp Flow Data Exchange Endpoint for dynamic appointment slot availability.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const settings = await getWhatsAppSettings();

    // 1. Decrypt incoming Flow request (handles encrypted payload or dev fallback)
    const decrypted = decryptFlowRequest<FlowDataExchangeRequest>(
      rawBody,
      settings.flowPrivateKey || undefined
    );

    const { action, screen, data, flow_token } = decrypted.decryptedBody;
    console.log(`WhatsApp Flow Data Exchange Action: ${action}, Screen: ${screen}`);

    let responseData: Record<string, any> = {};
    let nextScreen = screen || "APPOINTMENT_FORM";

    // 2. Action: INIT
    if (action === "INIT") {
      const today = new Date().toISOString().split("T")[0];
      const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Compute initial available slots for today
      const availability = await getAvailableTimeSlots(today, undefined, settings.clinicId);
      const formattedSlots = availability.slots
        .filter((s) => s.available)
        .map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description || "Available",
        }));

      responseData = {
        departments: [
          { id: "General Dentistry", title: "General Dentistry" },
          { id: "Orthodontics", title: "Orthodontics & Aligners" },
          { id: "Root Canal Therapy", title: "Endodontics & RCT" },
          { id: "Cosmetic Dentistry", title: "Teeth Whitening & Veneers" },
          { id: "Pediatric Dentistry", title: "Kids Dental Care" },
        ],
        doctors: [
          { id: "Any Available Doctor", title: "Any Available Doctor" },
          { id: "Dr. Sarah Jenkins", title: "Dr. Sarah Jenkins (Lead Dentist)" },
          { id: "Dr. Rajesh Sharma", title: "Dr. Rajesh Sharma (Orthodontist)" },
          { id: "Dr. Priya Patel", title: "Dr. Priya Patel (Endodontist)" },
        ],
        min_date: today,
        max_date: maxDate,
        appointment_date: today,
        time_slots: formattedSlots,
        has_slots: formattedSlots.length > 0,
        slot_notice:
          formattedSlots.length > 0
            ? `${formattedSlots.length} slots available for today`
            : "No slots remaining today. Please select an upcoming date.",
      };
    }

    // 3. Action: data_exchange (Date or Doctor selection change)
    else if (action === "data_exchange") {
      const selectedDate = data?.appointment_date || new Date().toISOString().split("T")[0];
      const selectedDoctor = data?.doctor;

      const availability = await getAvailableTimeSlots(
        selectedDate,
        selectedDoctor,
        settings.clinicId
      );

      const availableSlots = availability.slots
        .filter((s) => s.available)
        .map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description || "Available",
        }));

      responseData = {
        ...data,
        time_slots: availableSlots,
        has_slots: availableSlots.length > 0,
        slot_notice:
          availableSlots.length > 0
            ? `${availableSlots.length} available slots for ${selectedDate}`
            : `No available slots on ${selectedDate}. Please pick another date.`,
      };
    }

    // 4. Action: BACK
    else if (action === "BACK") {
      responseData = { ...data };
    }

    const flowResponse: FlowDataExchangeResponse = {
      version: "3.0",
      screen: nextScreen,
      data: responseData,
    };

    // 5. Encrypt response if the incoming payload was encrypted
    if (decrypted.isEncrypted && decrypted.aesKey && decrypted.initialVector) {
      const encryptedResponse = encryptFlowResponse(
        flowResponse,
        decrypted.aesKey,
        decrypted.initialVector
      );
      return new NextResponse(encryptedResponse, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Unencrypted plain JSON response for dev/test
    return NextResponse.json(flowResponse, { status: 200 });
  } catch (err: any) {
    console.error("WhatsApp Flow Data Exchange error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error in Flow Data Exchange",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
