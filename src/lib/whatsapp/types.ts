/**
 * WhatsApp Business Platform Cloud API & WhatsApp Flows Types
 * Supports Meta Graph API v20.0+ & WhatsApp Flows JSON Specification v3.0 / v4.0
 */

// -----------------------------------------------------------------------------
// Form Builder Schema (Internal Administrator Configurable Model)
// -----------------------------------------------------------------------------

export type FlowFieldType =
  | "short_text"
  | "long_text"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "date"
  | "static_text"
  | "hidden";

export interface FlowFieldOption {
  id: string;
  label: string;
  description?: string;
}

export interface FlowFieldDefinition {
  id: string;
  name: string;
  label: string;
  description?: string;
  type: FlowFieldType;
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: FlowFieldOption[];
  order: number;
  // Specific constraints
  minDate?: string; // "TODAY" or YYYY-MM-DD
  maxDate?: string;
  helperText?: string;
  // For dynamic exchange fields (e.g. time slots loaded dynamically based on date)
  isDynamic?: boolean;
}

export interface FlowFormSchema {
  title: string;
  description?: string;
  fields: FlowFieldDefinition[];
  submitButtonText: string;
  // Dynamic slot booking configuration
  enableDynamicSlots: boolean;
  slotDurationMinutes: number;
  departments: string[];
  doctors: string[];
}

export type WhatsAppFlowStatus =
  | "DRAFT"
  | "PUBLISHING"
  | "PUBLISHED"
  | "ACTIVE"
  | "INACTIVE"
  | "FAILED";

export type WhatsAppFlowCategory =
  | "APPOINTMENT_BOOKING"
  | "RESCHEDULE"
  | "CANCELLATION"
  | "SURVEY";

// -----------------------------------------------------------------------------
// Meta WhatsApp Cloud API Interactive Message Types
// -----------------------------------------------------------------------------

export interface WhatsAppButton {
  type: "reply";
  reply: {
    id: string;
    title: string;
  };
}

export interface WhatsAppFlowActionPayload {
  flow_token: string;
  flow_id: string;
  flow_cta: string;
  flow_action: "navigate" | "data_exchange";
  flow_action_payload?: {
    screen?: string;
    data?: Record<string, any>;
  };
}

// -----------------------------------------------------------------------------
// Meta WhatsApp Webhook Payload Types
// -----------------------------------------------------------------------------

export interface MetaWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: "whatsapp";
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: {
          name: string;
        };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        type:
          | "text"
          | "interactive"
          | "button"
          | "image"
          | "document"
          | "location"
          | "unknown";
        text?: {
          body: string;
        };
        interactive?: {
          type: "button_reply" | "list_reply" | "nfm_reply";
          button_reply?: {
            id: string;
            title: string;
          };
          list_reply?: {
            id: string;
            title: string;
            description?: string;
          };
          nfm_reply?: {
            response_json: string; // Serialized JSON string of submitted flow form
            body: string;
            name: string;
          };
        };
      }>;
      statuses?: Array<{
        id: string;
        status: "sent" | "delivered" | "read" | "failed";
        timestamp: string;
        recipient_id: string;
        errors?: Array<{
          code: number;
          title: string;
          message?: string;
        }>;
      }>;
    };
    field: string;
  }>;
}

export interface MetaWebhookPayload {
  object: "whatsapp_business_account";
  entry: MetaWebhookEntry[];
}

// -----------------------------------------------------------------------------
// Meta Flow Data Exchange Protocol Types
// -----------------------------------------------------------------------------

export interface FlowDataExchangeRequest {
  version: string;
  action: "INIT" | "data_exchange" | "BACK";
  screen: string;
  data: Record<string, any>;
  flow_token?: string;
}

export interface FlowDataExchangeResponse {
  version?: string;
  screen: string;
  data: Record<string, any>;
  error_message?: string;
}

export interface EncryptedFlowPayload {
  encrypted_flow_data: string;
  encrypted_aes_key: string;
  initial_vector: string;
}

// -----------------------------------------------------------------------------
// Clinic Availability & Slot Types
// -----------------------------------------------------------------------------

export interface TimeSlotOption {
  id: string;
  title: string;
  description?: string;
  available: boolean;
}

export interface AvailabilityResult {
  date: string;
  doctor?: string;
  slots: TimeSlotOption[];
  availableCount: number;
}
