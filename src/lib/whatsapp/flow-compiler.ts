import { FlowFormSchema, FlowFieldDefinition } from "./types";

/**
 * Meta WhatsApp Flows JSON Specification Compiler (v3.0 / v4.0)
 * Translates internal administrator form schema into official Meta WhatsApp Flow JSON.
 */

export const DEFAULT_BOOKING_FLOW_SCHEMA: FlowFormSchema = {
  title: "Book Dental Appointment",
  description: "Schedule your consultation with our specialist dentists directly inside WhatsApp.",
  submitButtonText: "Confirm & Book Appointment",
  enableDynamicSlots: true,
  slotDurationMinutes: 30,
  departments: [
    "General Dental Consultation & Checkup",
    "Orthodontic treatment & Aligners",
    "Dental implants & Titanium Roots",
    "Teeth whitening & Laser Bleaching",
    "Root canal microscope treatment",
    "Porcelain veneers & Lumineers",
    "Wisdom tooth surgical extraction",
    "Gum disease & Periodontal therapy",
  ],
  doctors: [
    "Dr. Sankar (Chief Dental Surgeon)",
    "Dr. Rohan Shah (Orthodontics)",
    "Dr. New Dental Specialist (Dental Surgeon)",
  ],
  fields: [
    {
      id: "field-name",
      name: "patient_name",
      label: "Full Name",
      description: "Enter the patient's full name",
      type: "short_text",
      required: true,
      placeholder: "e.g. John Doe",
      order: 1,
    },
    {
      id: "field-phone",
      name: "phone_number",
      label: "WhatsApp Phone Number",
      description: "Your primary phone number for appointment confirmation and reminders",
      type: "short_text",
      required: true,
      placeholder: "+1 (555) 000-0000",
      order: 2,
    },
    {
      id: "field-service",
      name: "service_name",
      label: "Dental Procedure or Department",
      description: "Select the clinical service you require",
      type: "dropdown",
      required: true,
      order: 3,
      options: [
        { id: "General Dental Consultation & Checkup", label: "General Consultation & Checkup" },
        { id: "Orthodontic treatment", label: "Orthodontics & Clear Aligners" },
        { id: "Dental implants", label: "Dental Implants & Restorations" },
        { id: "Teeth whitening", label: "Professional Teeth Whitening" },
        { id: "Root canal treatment", label: "Microscope Root Canal Treatment" },
        { id: "Veneers and lumineers", label: "Aesthetic Veneers & Lumineers" },
        { id: "Tooth extraction", label: "Gentle Tooth Extraction" },
        { id: "Gum disease treatment", label: "Periodontal Gum Care" },
      ],
    },
    {
      id: "field-doctor",
      name: "preferred_doctor",
      label: "Preferred Dental Specialist",
      description: "Optional: Choose your preferred doctor or select Any Available",
      type: "dropdown",
      required: false,
      defaultValue: "Any Available Specialist",
      order: 4,
      options: [
        { id: "Any Available Specialist", label: "Any Available Specialist (Fastest)" },
        { id: "Dr. Sankar (Chief Dental Surgeon)", label: "Dr. Sankar (Chief Dental Surgeon)" },
        { id: "Dr. Rohan Shah (Orthodontics)", label: "Dr. Rohan Shah (Orthodontics)" },
        { id: "Dr. New Dental Specialist (Dental Surgeon)", label: "Dr. New Dental Specialist" },
      ],
    },
    {
      id: "field-date",
      name: "appointment_date",
      label: "Preferred Date",
      description: "Select the date you would like to visit",
      type: "date",
      required: true,
      minDate: "TODAY",
      order: 5,
    },
    {
      id: "field-time-slot",
      name: "appointment_time_slot",
      label: "Available Time Slot",
      description: "Available slots dynamically synchronized with clinic calendar",
      type: "dropdown",
      required: true,
      isDynamic: true,
      order: 6,
      options: [
        { id: "09:30 AM", label: "09:30 AM - Morning Slot" },
        { id: "10:30 AM", label: "10:30 AM - Morning Slot" },
        { id: "11:30 AM", label: "11:30 AM - Morning Slot" },
        { id: "02:30 PM", label: "02:30 PM - Afternoon Slot" },
        { id: "03:30 PM", label: "03:30 PM - Afternoon Slot" },
        { id: "04:30 PM", label: "04:30 PM - Afternoon Slot" },
        { id: "05:30 PM", label: "05:30 PM - Evening Slot" },
      ],
    },
    {
      id: "field-reason",
      name: "appointment_reason",
      label: "Symptoms or Reason for Visit",
      description: "Briefly tell us what you are experiencing (e.g. toothache, routine checkup)",
      type: "long_text",
      required: false,
      placeholder: "Describe your symptoms or clinical requirements...",
      order: 7,
    },
  ],
};

/**
 * Converts a FlowFieldDefinition into a valid WhatsApp Flow component object
 */
function compileFieldToFlowComponent(field: FlowFieldDefinition): Record<string, any> {
  switch (field.type) {
    case "short_text":
      return {
        type: "TextInput",
        name: field.name,
        label: field.label,
        required: field.required,
        "input-type": "text",
        ...(field.placeholder ? { placeholder: field.placeholder } : {}),
        ...(field.helperText ? { "helper-text": field.helperText } : {}),
      };

    case "long_text":
      return {
        type: "TextArea",
        name: field.name,
        label: field.label,
        required: field.required,
        ...(field.placeholder ? { placeholder: field.placeholder } : {}),
        ...(field.helperText ? { "helper-text": field.helperText } : {}),
      };

    case "dropdown":
      return {
        type: "Dropdown",
        name: field.name,
        label: field.label,
        required: field.required,
        "data-source": (field.options || []).map((opt) => ({
          id: opt.id,
          title: opt.label,
          ...(opt.description ? { description: opt.description } : {}),
        })),
      };

    case "radio":
      return {
        type: "RadioButtonsGroup",
        name: field.name,
        label: field.label,
        required: field.required,
        "data-source": (field.options || []).map((opt) => ({
          id: opt.id,
          title: opt.label,
          ...(opt.description ? { description: opt.description } : {}),
        })),
      };

    case "checkbox":
      return {
        type: "CheckboxGroup",
        name: field.name,
        label: field.label,
        required: field.required,
        "data-source": (field.options || []).map((opt) => ({
          id: opt.id,
          title: opt.label,
          ...(opt.description ? { description: opt.description } : {}),
        })),
      };

    case "date":
      return {
        type: "DatePicker",
        name: field.name,
        label: field.label,
        required: field.required,
        ...(field.helperText ? { "helper-text": field.helperText } : {}),
      };

    case "static_text":
      return {
        type: "TextBody",
        text: field.label,
      };

    default:
      return {
        type: "TextInput",
        name: field.name,
        label: field.label,
        required: field.required,
      };
  }
}

/**
 * Compiles an administrator's FlowFormSchema into Meta's official WhatsApp Flow JSON v3.0
 */
export function compileFlowSchemaToMetaJson(
  schema: FlowFormSchema,
  options?: { flowEndpointUrl?: string }
): Record<string, any> {
  const sortedFields = [...schema.fields].sort((a, b) => a.order - b.order);

  // Group fields into Screen 1: Details & Date, and Screen 2: Time Slot & Confirmation
  // If enableDynamicSlots is true, screen 1 submits to data_exchange to fetch slots for screen 2
  const formChildren = sortedFields.map(compileFieldToFlowComponent);

  return {
    version: "3.0",
    data_api_version: "3.0",
    routing_model: {
      APPOINTMENT_FORM: ["CONFIRMATION_SUMMARY"],
      CONFIRMATION_SUMMARY: [],
    },
    screens: [
      {
        id: "APPOINTMENT_FORM",
        title: schema.title || "Book Appointment",
        data: {},
        layout: {
          type: "SingleColumnLayout",
          children: [
            ...(schema.description
              ? [
                  {
                    type: "TextSubheading",
                    text: schema.description,
                  },
                ]
              : []),
            {
              type: "Form",
              name: "booking_form",
              children: [
                ...formChildren,
                {
                  type: "Footer",
                  label: schema.submitButtonText || "Continue to Confirmation",
                  "on-click-action": {
                    name: "complete",
                    payload: sortedFields.reduce(
                      (acc, f) => {
                        acc[f.name] = `\${form.${f.name}}`;
                        return acc;
                      },
                      {} as Record<string, string>
                    ),
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  };
}

/**
 * Validates that an administrator's form schema has valid names and no duplicates
 */
export function validateFlowFormSchema(schema: FlowFormSchema): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!schema.title?.trim()) {
    errors.push("Flow title is required.");
  }

  if (!schema.fields || schema.fields.length === 0) {
    errors.push("At least one form field is required.");
  }

  const seenNames = new Set<string>();

  schema.fields.forEach((field, index) => {
    if (!field.name?.trim()) {
      errors.push(`Field at position ${index + 1} is missing a technical name.`);
    } else {
      const clean = field.name.trim();
      if (!/^[a-z0-9_]+$/i.test(clean)) {
        errors.push(`Field "${clean}" contains invalid characters. Use letters, numbers, and underscores.`);
      }
      if (seenNames.has(clean)) {
        errors.push(`Duplicate field name "${clean}" found.`);
      }
      seenNames.add(clean);
    }

    if (!field.label?.trim()) {
      errors.push(`Field "${field.name}" is missing a user-facing label.`);
    }

    if (["dropdown", "radio", "checkbox"].includes(field.type)) {
      if (!field.isDynamic && (!field.options || field.options.length === 0)) {
        errors.push(`Field "${field.name}" is a ${field.type} but has no options configured.`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
