import { getWhatsAppSettings } from "./settings-store";

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mocked?: boolean;
}

export class WhatsAppMetaClient {
  private phoneNumberId: string;
  private accessToken: string;
  private apiVersion = "v20.0";
  private baseUrl = "https://graph.facebook.com";

  constructor(phoneNumberId?: string, accessToken?: string) {
    this.phoneNumberId = phoneNumberId || "";
    this.accessToken = accessToken || "";
  }

  private async ensureCredentials(clinicId?: string) {
    if (!this.phoneNumberId || !this.accessToken) {
      const settings = await getWhatsAppSettings(clinicId);
      this.phoneNumberId = this.phoneNumberId || settings.phoneNumberId;
      this.accessToken = this.accessToken || settings.accessToken;
    }
  }

  /**
   * Send a standard plain text WhatsApp message.
   */
  async sendTextMessage(to: string, text: string, clinicId?: string): Promise<SendMessageResult> {
    await this.ensureCredentials(clinicId);

    // Clean recipient phone number
    const recipient = to.replace(/\D/g, "");

    if (!this.phoneNumberId || !this.accessToken) {
      // In development / demo mode without live Meta credentials
      const mockId = `wamid.HBg${Date.now()}${Math.floor(Math.random() * 10000)}`;
      return { success: true, messageId: mockId, mocked: true };
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "text",
          text: { preview_url: false, body: text },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || `HTTP ${response.status} failed`,
        };
      }

      const messageId = data?.messages?.[0]?.id;
      return { success: true, messageId };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  }

  /**
   * Send interactive quick reply buttons (e.g., Welcome Menu).
   * Note: Meta allows up to 3 interactive reply buttons per message.
   */
  async sendInteractiveButtons(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    headerText?: string,
    footerText?: string,
    clinicId?: string
  ): Promise<SendMessageResult> {
    await this.ensureCredentials(clinicId);
    const recipient = to.replace(/\D/g, "");

    if (!this.phoneNumberId || !this.accessToken) {
      const mockId = `wamid.HBg${Date.now()}${Math.floor(Math.random() * 10000)}`;
      return { success: true, messageId: mockId, mocked: true };
    }

    try {
      const formattedButtons = buttons.slice(0, 3).map((btn) => ({
        type: "reply",
        reply: {
          id: btn.id,
          title: btn.title.slice(0, 20), // Meta limit: 20 chars
        },
      }));

      const interactivePayload: any = {
        type: "button",
        body: { text: bodyText },
        action: { buttons: formattedButtons },
      };

      if (headerText) {
        interactivePayload.header = { type: "text", text: headerText };
      }
      if (footerText) {
        interactivePayload.footer = { text: footerText };
      }

      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "interactive",
          interactive: interactivePayload,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || `HTTP ${response.status} failed`,
        };
      }

      const messageId = data?.messages?.[0]?.id;
      return { success: true, messageId };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  }

  /**
   * Launch a native WhatsApp Flow directly inside the chat.
   * Uses Meta interactive message with type: "flow".
   */
  async sendFlowMessage(
    to: string,
    flowId: string,
    flowCta: string,
    bodyText: string,
    flowToken: string,
    initialScreen = "APPOINTMENT_FORM",
    initialData?: Record<string, any>,
    headerText?: string,
    footerText?: string,
    clinicId?: string
  ): Promise<SendMessageResult> {
    await this.ensureCredentials(clinicId);
    const recipient = to.replace(/\D/g, "");

    if (!this.phoneNumberId || !this.accessToken) {
      const mockId = `wamid.HBg${Date.now()}${Math.floor(Math.random() * 10000)}`;
      return { success: true, messageId: mockId, mocked: true };
    }

    try {
      const flowActionPayload: any = {
        screen: initialScreen,
      };
      if (initialData && Object.keys(initialData).length > 0) {
        flowActionPayload.data = initialData;
      }

      const interactivePayload: any = {
        type: "flow",
        body: { text: bodyText },
        action: {
          name: "flow",
          parameters: {
            flow_message_version: "3",
            flow_token: flowToken,
            flow_id: flowId,
            flow_cta: flowCta,
            flow_action: "navigate",
            flow_action_payload: flowActionPayload,
          },
        },
      };

      if (headerText) {
        interactivePayload.header = { type: "text", text: headerText };
      }
      if (footerText) {
        interactivePayload.footer = { text: footerText };
      }

      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "interactive",
          interactive: interactivePayload,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || `HTTP ${response.status} failed`,
        };
      }

      const messageId = data?.messages?.[0]?.id;
      return { success: true, messageId };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  }

  /**
   * Publish a Flow on Meta Cloud API.
   * Official endpoint: POST https://graph.facebook.com/v20.0/{flow_id}/publish
   */
  async publishFlowOnMeta(flowId: string, clinicId?: string): Promise<{ success: boolean; error?: string }> {
    await this.ensureCredentials(clinicId);

    if (!this.accessToken) {
      // Offline/demo mode
      return { success: true };
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/${flowId}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || `Flow publication returned HTTP ${response.status}`,
        };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to publish flow on Meta" };
    }
  }

  /**
   * Check connection status with Meta Cloud API.
   */
  async testConnection(clinicId?: string): Promise<{
    connected: boolean;
    displayPhoneNumber?: string;
    verifiedName?: string;
    qualityRating?: string;
    error?: string;
  }> {
    await this.ensureCredentials(clinicId);

    if (!this.phoneNumberId || !this.accessToken) {
      return {
        connected: false,
        error: "Missing Phone Number ID or Access Token in configuration.",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          connected: false,
          error: data?.error?.message || `Connection failed with status ${response.status}`,
        };
      }

      return {
        connected: true,
        displayPhoneNumber: data.display_phone_number,
        verifiedName: data.verified_name,
        qualityRating: data.quality_rating,
      };
    } catch (err: any) {
      return { connected: false, error: err.message || "Failed to connect to Meta API" };
    }
  }
}

export const metaClient = new WhatsAppMetaClient();
