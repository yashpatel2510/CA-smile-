import { prisma } from "@/lib/prisma";
import { parseSlotTime } from "./availability-service";
import { conversationService } from "./conversation-service";
import { metaClient } from "./meta-client";
import { getWhatsAppSettings } from "./settings-store";
import inMemoryStore from "@/lib/in-memory-store";

export interface WhatsAppBookingInput {
  waId: string;
  patientName: string;
  patientPhone?: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:00 AM"
  department?: string;
  doctor?: string;
  reason?: string;
  patientAge?: string | number;
  additionalNotes?: string;
  clinicId?: string;
}

export interface BookingResult {
  success: boolean;
  appointmentId?: string;
  referenceCode?: string;
  error?: string;
  code?: "SLOT_UNAVAILABLE" | "VALIDATION_ERROR" | "DATABASE_ERROR";
}

// In-memory slot mutex locks to prevent race conditions during concurrent bookings
const slotLocks = new Set<string>();

export class WhatsAppBookingService {
  /**
   * Concurrency-safe atomic appointment reservation.
   */
  async bookFromWhatsApp(input: WhatsAppBookingInput): Promise<BookingResult> {
    const {
      waId,
      patientName,
      patientPhone = waId,
      appointmentDate,
      appointmentTime,
      department = "General Dentistry",
      doctor = "Any Available Doctor",
      reason = "WhatsApp Online Booking",
      patientAge,
      additionalNotes,
    } = input;

    if (!appointmentDate || !appointmentTime || !patientName) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        error: "Missing required booking fields (name, date, time).",
      };
    }

    // 1. Calculate Start Time & End Time
    const [year, month, day] = appointmentDate.split("-").map((v) => parseInt(v, 10));
    const { hours, minutes } = parseSlotTime(appointmentTime);

    const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const endTime = new Date(year, month - 1, day, hours, minutes + 30, 0, 0);

    // Concurrency Lock Key
    const cleanDoctor = doctor === "Any Available Doctor" ? "GENERAL" : doctor;
    const lockKey = `${appointmentDate}_${hours}_${minutes}_${cleanDoctor}`;

    if (slotLocks.has(lockKey)) {
      return {
        success: false,
        code: "SLOT_UNAVAILABLE",
        error: "This time slot is currently being processed by another patient. Please choose another time.",
      };
    }

    slotLocks.add(lockKey);

    try {
      // 2. Concurrency-Safe Database Validation: check if already booked
      const existingDbBooking = await prisma.appointment.findFirst({
        where: {
          startTime,
          status: { notIn: ["CANCELLED", "DECLINED", "NO_SHOW"] },
          ...(cleanDoctor !== "GENERAL" ? { preferredDoctor: doctor } : {}),
        },
      });

      if (existingDbBooking) {
        return {
          success: false,
          code: "SLOT_UNAVAILABLE",
          error: "Selected appointment slot is no longer available. Please select another time.",
        };
      }

      // Check in-memory store as well for safety
      const memBookings = inMemoryStore.getAppointments();
      const existingMemBooking = memBookings.find(
        (a) =>
          new Date(a.startTime).getTime() === startTime.getTime() &&
          a.status !== "CANCELLED" &&
          a.status !== "DECLINED" &&
          a.status !== "NO_SHOW" &&
          (cleanDoctor === "GENERAL" || a.preferredDoctor === doctor)
      );

      if (existingMemBooking) {
        return {
          success: false,
          code: "SLOT_UNAVAILABLE",
          error: "Selected appointment slot is no longer available. Please select another time.",
        };
      }

      // 3. Resolve or Create Clinic
      let clinic = await prisma.clinic.findFirst();
      if (!clinic) {
        clinic = await prisma.clinic.create({
          data: {
            name: "Apex Dental Clinic",
            slug: "apex-dental-clinic",
            address: "Medical Square, Suite 400",
            phone: "+91 98765 43210",
            email: "info@apexdental.com",
          },
        });
      }

      // 4. Resolve or Create Patient (matching on normalized phone number)
      const cleanPhone = (patientPhone || waId).replace(/\D/g, "");
      const phoneLookup = cleanPhone.slice(-10);

      let patient = await prisma.patient.findFirst({
        where: {
          phone: { contains: phoneLookup },
        },
      });

      const nameParts = patientName.trim().split(" ");
      const firstName = nameParts[0] || "Patient";
      const lastName = nameParts.slice(1).join(" ") || "";

      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            clinicId: clinic.id,
            firstName,
            lastName,
            phone: cleanPhone,
            gender: "OTHER",
          },
        });
      }

      // 5. Resolve or Create Service
      let service = await prisma.service.findFirst({
        where: {
          OR: [
            { name: { contains: department, mode: "insensitive" } },
            { category: { contains: department, mode: "insensitive" } },
            { name: "Consultation" },
          ],
        },
      });

      if (!service) {
        service = await prisma.service.create({
          data: {
            clinicId: clinic.id,
            name: `${department} Consultation`,
            category: department,
            durationMinutes: 30,
            price: 500,
          },
        });
      }

      // 6. Generate Reference Number: AP-XXXXX
      const referenceCode = `AP-${Math.floor(10000 + Math.random() * 90000)}`;

      // 7. Atomically Create the Appointment
      const noteDetails = [
        `WhatsApp Reference: ${referenceCode}`,
        patientAge ? `Patient Age: ${patientAge}` : null,
        additionalNotes ? `Notes: ${additionalNotes}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const appointment = await prisma.appointment.create({
        data: {
          clinicId: clinic.id,
          patientId: patient.id,
          serviceId: service.id,
          startTime,
          endTime,
          status: "CONFIRMED",
          source: "WHATSAPP",
          reason: reason || "WhatsApp Appointment Booking",
          preferredDoctor: doctor !== "Any Available Doctor" ? doctor : "Assigned Duty Doctor",
          contactMethod: "WHATSAPP",
          notes: noteDetails,
          confirmedAt: new Date(),
        },
      });

      // 8. Sync into in-memory store for instant visibility across admin pages
      inMemoryStore.saveAppointment({
        id: appointment.id,
        clinicId: clinic.id,
        patientId: patient.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: "CONFIRMED",
        source: "WHATSAPP",
        reason: reason || "WhatsApp Appointment Booking",
        preferredDoctor: doctor,
        contactMethod: "WHATSAPP",
        notes: noteDetails,
        confirmedAt: new Date().toISOString(),
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          phone: patient.phone,
        },
        service: {
          id: service.id,
          name: service.name,
          category: service.category || undefined,
          price: Number(service.price || 500),
          durationMinutes: service.durationMinutes || 30,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 9. Link to WhatsApp Conversation and Log Outbound Confirmation
      const conversation = await conversationService.getOrCreateConversation(
        waId,
        patientName,
        clinic.id
      );

      const settings = await getWhatsAppSettings(clinic.id);
      let confirmationTemplate =
        settings.confirmationMessage ||
        "Your appointment has been booked successfully! ✅\n\nAppointment ID: {APPOINTMENT_ID}\nPatient: {PATIENT_NAME}\nDate: {DATE}\nTime: {TIME}\nDoctor: {DOCTOR}\n\nPlease arrive 10 minutes prior to your scheduled time.\n\nThank you for choosing our clinic!";

      const confirmationText = confirmationTemplate
        .replace("{APPOINTMENT_ID}", referenceCode)
        .replace("{PATIENT_NAME}", patientName)
        .replace("{DATE}", appointmentDate)
        .replace("{TIME}", appointmentTime)
        .replace("{DOCTOR}", doctor);

      // Send WhatsApp confirmation message safely (preserve booking if message fails)
      try {
        const sendResult = await metaClient.sendTextMessage(
          waId,
          confirmationText,
          clinic.id
        );

        await conversationService.recordMessage({
          conversationId: conversation.id,
          whatsappMessageId: sendResult.messageId,
          direction: "OUTBOUND",
          senderType: "BOT",
          senderName: "Clinic Bot",
          messageType: "TEXT",
          body: confirmationText,
          status: sendResult.success ? "SENT" : "FAILED",
          appointmentId: appointment.id,
        });
      } catch (msgErr) {
        console.error("Failed to deliver WhatsApp confirmation text, booking preserved:", msgErr);
      }

      return {
        success: true,
        appointmentId: appointment.id,
        referenceCode,
      };
    } catch (err: any) {
      console.error("WhatsApp booking transaction error:", err);
      return {
        success: false,
        code: "DATABASE_ERROR",
        error: err.message || "Failed to reserve appointment in database.",
      };
    } finally {
      // Release lock
      slotLocks.delete(lockKey);
    }
  }
}

export const bookingService = new WhatsAppBookingService();
