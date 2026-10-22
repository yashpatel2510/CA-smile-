import { prisma } from "@/lib/prisma";
import { metaClient } from "./meta-client";
import { getWhatsAppSettings } from "./settings-store";
import inMemoryStore from "@/lib/in-memory-store";

export interface ConversationSummary {
  id: string;
  waId: string;
  patientName: string;
  patientPhone: string;
  lastMessageText?: string;
  lastMessageTimestamp?: string;
  unreadCount: number;
  status: string;
  botEnabled: boolean;
  assignedStaffId?: string;
  patientId?: string;
}

// In-memory fallback for conversations and messages
declare global {
  // eslint-disable-next-line no-var
  var __inMemoryConversations: Map<string, any> | undefined;
  // eslint-disable-next-line no-var
  var __inMemoryMessages: any[] | undefined;
}

if (!global.__inMemoryConversations) global.__inMemoryConversations = new Map();
if (!global.__inMemoryMessages) global.__inMemoryMessages = [];

export class WhatsAppConversationService {
  /**
   * Find or create a WhatsApp conversation by phone number (waId).
   */
  async getOrCreateConversation(
    waId: string,
    profileName?: string,
    clinicId?: string
  ): Promise<any> {
    const cleanWaId = waId.replace(/\D/g, "");
    const effectiveClinicId = clinicId || "default-clinic";

    try {
      let conversation = await prisma.whatsAppConversation.findFirst({
        where: { waId: cleanWaId },
        include: { patient: true },
      });

      if (!conversation) {
        // Try linking to existing patient by phone
        let patient = await prisma.patient.findFirst({
          where: {
            phone: { contains: cleanWaId.slice(-10) },
          },
        });

        // Resolve real clinic from DB
        let resolvedClinicId = effectiveClinicId;
        const clinicRecord = await prisma.clinic.findFirst();
        if (clinicRecord) {
          resolvedClinicId = clinicRecord.id;
        }

        conversation = await prisma.whatsAppConversation.create({
          data: {
            clinicId: resolvedClinicId,
            waId: cleanWaId,
            profileName: profileName || (patient ? `${patient.firstName} ${patient.lastName}` : cleanWaId),
            patientId: patient?.id,
            status: "OPEN",
            botEnabled: true,
            unreadCount: 0,
          },
          include: { patient: true },
        });
      }

      return conversation;
    } catch (err) {
      // In-memory fallback
      let memConv = global.__inMemoryConversations?.get(cleanWaId);
      if (!memConv) {
        memConv = {
          id: `conv_${cleanWaId}_${Date.now()}`,
          clinicId: effectiveClinicId,
          waId: cleanWaId,
          patientName: profileName || cleanWaId,
          patientPhone: cleanWaId,
          unreadCount: 0,
          status: "OPEN",
          botEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        global.__inMemoryConversations?.set(cleanWaId, memConv);
      }
      return memConv;
    }
  }

  /**
   * Record an incoming or outgoing message in the database and conversation history.
   * Prevents duplicates via unique whatsappMessageId.
   */
  async recordMessage(params: {
    conversationId: string;
    whatsappMessageId?: string;
    direction: "INBOUND" | "OUTBOUND";
    senderType: "PATIENT" | "BOT" | "STAFF";
    senderName?: string;
    messageType: string;
    body: string;
    payload?: any;
    status?: string;
    appointmentId?: string;
  }): Promise<any> {
    const {
      conversationId,
      whatsappMessageId,
      direction,
      senderType,
      senderName,
      messageType,
      body,
      payload,
      status = "SENT",
      appointmentId,
    } = params;

    // Check for duplicate message ID
    if (whatsappMessageId) {
      try {
        const existing = await prisma.whatsAppMessage.findUnique({
          where: { whatsappMessageId },
        });
        if (existing) {
          return existing; // Skip duplicate processing
        }
      } catch (err) {
        const memExists = global.__inMemoryMessages?.find(
          (m) => m.whatsappMessageId === whatsappMessageId
        );
        if (memExists) return memExists;
      }
    }

    try {
      const message = await prisma.whatsAppMessage.create({
        data: {
          conversationId,
          whatsappMessageId,
          direction,
          senderType,
          senderName,
          messageType,
          body,
          payload: payload || undefined,
          status,
          appointmentId,
        },
      });

      // Update conversation summary
      await prisma.whatsAppConversation.update({
        where: { id: conversationId },
        data: {
          lastMessageText: body.slice(0, 200),
          lastMessageTimestamp: new Date(),
          unreadCount: direction === "INBOUND" ? { increment: 1 } : undefined,
        },
      });

      return message;
    } catch (err) {
      // In-memory fallback
      const newMsg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        conversationId,
        whatsappMessageId,
        direction,
        senderType,
        senderName,
        messageType,
        body,
        payload,
        status,
        appointmentId,
        createdAt: new Date().toISOString(),
      };
      global.__inMemoryMessages?.push(newMsg);

      // Update in-memory conversation
      for (const [k, conv] of Array.from(global.__inMemoryConversations?.entries() || [])) {
        if (conv.id === conversationId) {
          conv.lastMessageText = body.slice(0, 200);
          conv.lastMessageTimestamp = new Date().toISOString();
          if (direction === "INBOUND") conv.unreadCount = (conv.unreadCount || 0) + 1;
          global.__inMemoryConversations?.set(k, conv);
          break;
        }
      }

      return newMsg;
    }
  }

  /**
   * Handle an inbound text message from a patient.
   */
  async handleInboundTextMessage(
    waId: string,
    messageId: string,
    textBody: string,
    profileName?: string
  ): Promise<void> {
    const conversation = await this.getOrCreateConversation(waId, profileName);

    // Save the incoming patient message
    await this.recordMessage({
      conversationId: conversation.id,
      whatsappMessageId: messageId,
      direction: "INBOUND",
      senderType: "PATIENT",
      senderName: profileName || conversation.patientName,
      messageType: "TEXT",
      body: textBody,
    });

    // Check if automated bot handling is active for this chat
    if (!conversation.botEnabled) {
      // Human agent mode - do not auto-reply
      return;
    }

    const cleanText = textBody.trim().toLowerCase();

    // Check if greeting or request to book
    const isGreeting =
      ["hi", "hello", "hey", "hola", "namaste", "start", "menu", "help", "book"].includes(
        cleanText
      ) || cleanText.includes("appointment");

    if (isGreeting) {
      await this.sendWelcomeMenu(conversation);
      return;
    }

    if (cleanText === "my appointments") {
      await this.sendPatientAppointments(conversation);
      return;
    }

    if (cleanText === "contact reception") {
      await this.handleContactReception(conversation);
      return;
    }

    // Default friendly response directing to menu
    await this.sendWelcomeMenu(conversation);
  }

  /**
   * Send the interactive Welcome Menu with interactive options.
   */
  async sendWelcomeMenu(conversation: any): Promise<void> {
    const settings = await getWhatsAppSettings(conversation.clinicId);

    const welcomeText =
      settings.welcomeMessage ||
      "Welcome to our Dental Clinic! 👋\n\nHow can we help you today? Please choose an option below:";

    const buttons = [
      { id: "BTN_BOOK", title: "📅 Book Appointment" },
      { id: "BTN_MY_APPTS", title: "📋 My Appointments" },
      { id: "BTN_CONTACT", title: "📞 Contact Clinic" },
    ];

    const result = await metaClient.sendInteractiveButtons(
      conversation.waId,
      welcomeText,
      buttons,
      "Apex Dental Care",
      "Replies typically within minutes",
      conversation.clinicId
    );

    await this.recordMessage({
      conversationId: conversation.id,
      whatsappMessageId: result.messageId,
      direction: "OUTBOUND",
      senderType: "BOT",
      senderName: "Clinic Bot",
      messageType: "INTERACTIVE",
      body: welcomeText,
      payload: { buttons },
    });
  }

  /**
   * Launch the active appointment booking WhatsApp Flow for this conversation.
   */
  async launchBookingFlow(conversation: any): Promise<void> {
    // Check if we have an active published Flow in database or fallback
    let activeFlowId = "flow_appointment_booking";

    try {
      const activeFlow = await prisma.whatsAppFlow.findFirst({
        where: {
          category: "APPOINTMENT_BOOKING",
          isActive: true,
        },
      });
      if (activeFlow && activeFlow.metaFlowId) {
        activeFlowId = activeFlow.metaFlowId;
      }
    } catch (err) {}

    const flowToken = `flow_${conversation.waId}_${Date.now()}`;
    const flowCta = "Book an Appointment";
    const bodyText =
      "Please tap below to choose your doctor, date, and preferred time slot directly inside WhatsApp:";

    const initialData = {
      patient_name: conversation.patientName || "",
      patient_phone: conversation.patientPhone || conversation.waId,
    };

    const result = await metaClient.sendFlowMessage(
      conversation.waId,
      activeFlowId,
      flowCta,
      bodyText,
      flowToken,
      "APPOINTMENT_FORM",
      initialData,
      "Book Your Visit",
      "Official Clinic Booking",
      conversation.clinicId
    );

    await this.recordMessage({
      conversationId: conversation.id,
      whatsappMessageId: result.messageId,
      direction: "OUTBOUND",
      senderType: "BOT",
      senderName: "Clinic Bot",
      messageType: "FLOW",
      body: `${bodyText} [Interactive Flow: ${flowCta}]`,
      payload: { flowId: activeFlowId, flowToken, initialData },
    });
  }

  /**
   * Send the patient their upcoming appointments.
   */
  async sendPatientAppointments(conversation: any): Promise<void> {
    const now = new Date();
    let text = "";

    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          patient: {
            phone: { contains: conversation.waId.slice(-10) },
          },
          startTime: { gte: now },
          status: { notIn: ["CANCELLED", "DECLINED"] },
        },
        include: { service: true },
        orderBy: { startTime: "asc" },
        take: 3,
      });

      if (appointments.length === 0) {
        text = "You currently have no upcoming appointments.\n\nReply with 'Book' to schedule a new visit!";
      } else {
        text = "Here are your upcoming appointments:\n\n";
        appointments.forEach((apt, idx) => {
          const d = new Date(apt.startTime);
          const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
          text += `${idx + 1}. ${apt.service?.name || "Consultation"}\n   📅 ${dateStr} at ${timeStr}\n   ID: ${apt.id}\n   Status: ${apt.status}\n\n`;
        });
        text += "To reschedule or cancel, please contact reception or reply below.";
      }
    } catch (err) {
      text = "You currently have no upcoming appointments.\n\nReply with 'Book' to schedule a new visit!";
    }

    const result = await metaClient.sendTextMessage(conversation.waId, text, conversation.clinicId);
    await this.recordMessage({
      conversationId: conversation.id,
      whatsappMessageId: result.messageId,
      direction: "OUTBOUND",
      senderType: "BOT",
      senderName: "Clinic Bot",
      messageType: "TEXT",
      body: text,
    });
  }

  /**
   * Handle "Contact Reception" action.
   */
  async handleContactReception(conversation: any): Promise<void> {
    const text =
      "📞 Reception Desk:\n\nPhone: +91 98765 43210\nHours: Mon-Sat 9:00 AM - 6:00 PM\nAddress: Apex Dental Clinic, Medical Square, Suite 400.\n\nA staff member has been notified and will reply shortly.";

    // Switch to human agent mode
    try {
      await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { botEnabled: false, status: "WAITING_STAFF" },
      });
    } catch (err) {
      if (conversation.id) conversation.botEnabled = false;
    }

    const result = await metaClient.sendTextMessage(conversation.waId, text, conversation.clinicId);
    await this.recordMessage({
      conversationId: conversation.id,
      whatsappMessageId: result.messageId,
      direction: "OUTBOUND",
      senderType: "BOT",
      senderName: "Clinic Bot",
      messageType: "TEXT",
      body: text,
    });
  }

  /**
   * Send a manual reply from authorized staff in the admin panel.
   */
  async sendStaffReply(
    conversationId: string,
    staffName: string,
    messageText: string
  ): Promise<any> {
    let conversation: any;
    try {
      conversation = await prisma.whatsAppConversation.findUnique({
        where: { id: conversationId },
      });
    } catch (err) {}

    if (!conversation) {
      conversation = Array.from(global.__inMemoryConversations?.values() || []).find(
        (c) => c.id === conversationId
      );
    }

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Send via Meta Cloud API
    const result = await metaClient.sendTextMessage(
      conversation.waId,
      messageText,
      conversation.clinicId
    );

    // Save in thread
    const msg = await this.recordMessage({
      conversationId,
      whatsappMessageId: result.messageId,
      direction: "OUTBOUND",
      senderType: "STAFF",
      senderName: staffName,
      messageType: "TEXT",
      body: messageText,
      status: result.success ? "SENT" : "FAILED",
    });

    return { message: msg, result };
  }

  /**
   * Fetch all conversations for the admin inbox.
   */
  async listConversations(params?: {
    search?: string;
    status?: string;
  }): Promise<ConversationSummary[]> {
    const { search, status } = params || {};

    try {
      const records = await prisma.whatsAppConversation.findMany({
        where: {
          ...(status && status !== "ALL" ? { status } : {}),
          ...(search
            ? {
                OR: [
                  { profileName: { contains: search, mode: "insensitive" } },
                  { waId: { contains: search } },
                  { lastMessageText: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: { patient: true },
        orderBy: { lastMessageTimestamp: "desc" },
      });

      return records.map((r) => {
        const patientName = r.patient
          ? `${r.patient.firstName} ${r.patient.lastName}`.trim()
          : r.profileName || r.waId;
        const patientPhone = r.patient?.phone || r.waId;

        return {
          id: r.id,
          waId: r.waId,
          patientName,
          patientPhone,
          lastMessageText: r.lastMessageText || undefined,
          lastMessageTimestamp: r.lastMessageTimestamp ? r.lastMessageTimestamp.toISOString() : undefined,
          unreadCount: r.unreadCount,
          status: r.status,
          botEnabled: r.botEnabled,
          assignedStaffId: r.assignedStaffId || undefined,
          patientId: r.patientId || undefined,
        };
      });
    } catch (err) {
      // In-memory fallback
      let list = Array.from(global.__inMemoryConversations?.values() || []);
      if (status && status !== "ALL") {
        list = list.filter((c) => c.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.patientName.toLowerCase().includes(q) ||
            c.patientPhone.includes(q) ||
            (c.lastMessageText && c.lastMessageText.toLowerCase().includes(q))
        );
      }
      return list;
    }
  }

  /**
   * Get all messages for a specific conversation.
   */
  async getMessages(conversationId: string): Promise<any[]> {
    try {
      const msgs = await prisma.whatsAppMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
      });

      // Reset unread count
      await prisma.whatsAppConversation.update({
        where: { id: conversationId },
        data: { unreadCount: 0 },
      });

      return msgs;
    } catch (err) {
      return (global.__inMemoryMessages || []).filter((m) => m.conversationId === conversationId);
    }
  }
}

export const conversationService = new WhatsAppConversationService();
