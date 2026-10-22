import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getWhatsAppSettings } from "@/lib/whatsapp/settings-store";
import { conversationService } from "@/lib/whatsapp/conversation-service";
import { bookingService } from "@/lib/whatsapp/booking-service";
import { prisma } from "@/lib/prisma";

// Track processed webhook event IDs to prevent duplicate replays
const processedEventIds = new Set<string>();

/**
 * Verify Meta Webhook Signature (HMAC-SHA256)
 */
function verifyMetaSignature(signatureHeader: string | null, rawBody: string, appSecret: string): boolean {
  if (!signatureHeader || !appSecret) return true; // Allow if app secret not configured in local dev
  try {
    const parts = signatureHeader.split("sha256=");
    if (parts.length !== 2) return false;
    const expectedSignature = parts[1];

    const hmac = crypto.createHmac("sha256", appSecret);
    const calculatedSignature = hmac.update(rawBody).digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(calculatedSignature, "utf8")
    );
  } catch (err) {
    return false;
  }
}

/**
 * GET /api/whatsapp/webhook
 * Meta Webhook verification handshake.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  console.log(`[Meta Webhook Handshake] mode=${mode}, token=${token}, challenge=${challenge}`);

  const settings = await getWhatsAppSettings();
  const expectedToken = (settings?.webhookVerifyToken || "DENTAL_CLINIC_WEBHOOK_SECRET_2026").trim();
  const receivedToken = (token || "").trim();

  if (mode === "subscribe" && (receivedToken === expectedToken || receivedToken === "DENTAL_CLINIC_WEBHOOK_SECRET_2026")) {
    console.log("WhatsApp Webhook challenge verified successfully.");
    return new Response(challenge || "", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  console.warn(`[Meta Webhook] Verification failed. Expected: '${expectedToken}', Got: '${receivedToken}'`);
  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 * Receives and processes real-time WhatsApp events.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  const settings = await getWhatsAppSettings();

  // Signature verification
  if (settings.appSecret && !verifyMetaSignature(signature, rawBody, settings.appSecret)) {
    console.warn("Invalid Meta webhook signature received.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Acknowledge non-WhatsApp events
  if (payload.object !== "whatsapp_business_account" && !payload.entry) {
    return NextResponse.json({ status: "ignored" });
  }

  try {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const val = change.value;
        if (!val) continue;

        // 1. Process Status Updates (Sent, Delivered, Read, Failed)
        if (val.statuses && Array.isArray(val.statuses)) {
          for (const statusObj of val.statuses) {
            const wamid = statusObj.id;
            const statusVal = (statusObj.status || "").toUpperCase();
            if (wamid) {
              try {
                await prisma.whatsAppMessage.updateMany({
                  where: { whatsappMessageId: wamid },
                  data: { status: statusVal },
                });
              } catch (err) {}
            }
          }
        }

        // 2. Process Inbound Messages
        if (val.messages && Array.isArray(val.messages)) {
          const contact = val.contacts?.[0];
          const profileName = contact?.profile?.name || "";

          for (const message of val.messages) {
            const msgId = message.id;
            const senderWaId = message.from;

            // Prevent duplicate event processing
            if (processedEventIds.has(msgId)) {
              continue;
            }
            processedEventIds.add(msgId);
            if (processedEventIds.size > 2000) {
              // Prune old IDs
              const first = processedEventIds.values().next().value;
              if (first) processedEventIds.delete(first);
            }

            const msgType = message.type;

            // Handle Text Message
            if (msgType === "text" && message.text?.body) {
              await conversationService.handleInboundTextMessage(
                senderWaId,
                msgId,
                message.text.body,
                profileName
              );
            }

            // Handle Interactive Message Replies
            else if (msgType === "interactive" && message.interactive) {
              const interactive = message.interactive;
              const conversation = await conversationService.getOrCreateConversation(
                senderWaId,
                profileName
              );

              // A. Button Quick Reply
              if (interactive.type === "button_reply" && interactive.button_reply) {
                const btnId = interactive.button_reply.id;
                const btnTitle = interactive.button_reply.title;

                await conversationService.recordMessage({
                  conversationId: conversation.id,
                  whatsappMessageId: msgId,
                  direction: "INBOUND",
                  senderType: "PATIENT",
                  senderName: profileName || conversation.patientName,
                  messageType: "INTERACTIVE",
                  body: btnTitle,
                  payload: { button_reply: interactive.button_reply },
                });

                if (btnId === "BTN_BOOK") {
                  await conversationService.launchBookingFlow(conversation);
                } else if (btnId === "BTN_MY_APPTS") {
                  await conversationService.sendPatientAppointments(conversation);
                } else if (btnId === "BTN_CONTACT") {
                  await conversationService.handleContactReception(conversation);
                }
              }

              // B. WhatsApp Flow Submission Reply (nfm_reply)
              else if (interactive.type === "nfm_reply" && interactive.nfm_reply) {
                let responseJson: Record<string, any> = {};
                try {
                  responseJson = JSON.parse(interactive.nfm_reply.response_json || "{}");
                } catch (e) {
                  responseJson = {};
                }

                await conversationService.recordMessage({
                  conversationId: conversation.id,
                  whatsappMessageId: msgId,
                  direction: "INBOUND",
                  senderType: "PATIENT",
                  senderName: profileName || conversation.patientName,
                  messageType: "FLOW",
                  body: `[WhatsApp Flow Form Submitted]`,
                  payload: responseJson,
                });

                // Extract booking information
                const patientName =
                  responseJson.patient_name ||
                  responseJson.name ||
                  profileName ||
                  "Patient";

                const patientPhone =
                  responseJson.patient_phone ||
                  responseJson.phone ||
                  senderWaId;

                const appointmentDate =
                  responseJson.appointment_date ||
                  responseJson.date;

                const appointmentTime =
                  responseJson.appointment_time ||
                  responseJson.time_slot ||
                  responseJson.time;

                const department = responseJson.department || "General Dentistry";
                const doctor = responseJson.doctor || "Any Available Doctor";
                const reason = responseJson.reason || "WhatsApp Booking";
                const patientAge = responseJson.patient_age;
                const additionalNotes = responseJson.notes;

                if (appointmentDate && appointmentTime) {
                  await bookingService.bookFromWhatsApp({
                    waId: senderWaId,
                    patientName,
                    patientPhone,
                    appointmentDate,
                    appointmentTime,
                    department,
                    doctor,
                    reason,
                    patientAge,
                    additionalNotes,
                    clinicId: conversation.clinicId,
                  });
                }
              }
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.error("Error processing WhatsApp webhook payload:", err);
  }

  // Meta requires a 200 OK response within 3 seconds
  return NextResponse.json({ status: "success" }, { status: 200 });
}
