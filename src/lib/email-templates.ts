import { clinicThemes } from "@/config/theme.config";
import { env } from "@/lib/env";

const theme =
  clinicThemes[env.NEXT_PUBLIC_DEFAULT_THEME] || clinicThemes["teal-serenity"];

const primaryColor = theme.colors.primary; // e.g. #0d9488
const accentColor = theme.colors.accent; // e.g. #ccfbf1
const brandName = "CA Smile Dental Clinic";
const clinicAddress =
  "1ST FLOOR LABDHI ARCADE, ABOVE HDFC BANK, BILIMORA, GUJARAT 396321";
const clinicPhone = "+91 72260 98074";
const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface BaseEmailData {
  patientName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorName?: string;
  servicePrice?: number | string;
  durationMinutes?: number;
  location?: string;
}

/**
 * 1. Booking Request Received Email Template
 */
export function renderBookingRequestReceivedEmail(data: BaseEmailData) {
  const subject = `Appointment Request Received: ${data.serviceName} - ${brandName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <tr>
            <td style="background-color: ${primaryColor}; padding: 32px 30px; text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">${brandName}</div>
              <div style="font-size: 13px; color: ${accentColor}; margin-top: 4px;">Appointment Booking Desk</div>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 30px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                ⏳ Request Under Clinical Review
              </div>
              <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 16px 0 8px;">We Received Your Request, ${data.patientName}</h1>
              <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0;">
                Thank you for scheduling with ${brandName}. Our clinical desk is reviewing your requested consultation time.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px 24px;">
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 35%;">Requested Service:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${data.serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Requested Date:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: ${primaryColor};">${data.appointmentDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Requested Time:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${data.appointmentTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Status:</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #d97706;">Pending Confirmation</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px 28px;">
              <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0;">
                <strong>What happens next?</strong><br>
                Our staff verifies clinician availability and will dispatch an official confirmation email shortly. If any schedule conflicts arise, we will offer immediate alternative slots.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 4px;">Questions? Call our triage desk at <a href="tel:5552345678" style="color: ${primaryColor}; text-decoration: none;">${clinicPhone}</a>.</p>
              <p style="margin: 0;">${clinicAddress}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Appointment Request Received - ${brandName}
-------------------------------------------
Hello ${data.patientName},

We received your request for ${data.serviceName} on ${data.appointmentDate} at ${data.appointmentTime}.
Our clinical staff is reviewing provider availability and will send a confirmation shortly.

Questions? Call us at ${clinicPhone}.
${clinicAddress}
`;

  return { subject, html, text };
}

/**
 * 2. Booking Confirmed Email Template
 */
export function renderBookingConfirmedEmail(data: BaseEmailData) {
  const subject = `✓ Confirmed: Your Appointment on ${data.appointmentDate} - ${brandName}`;
  const portalUrl = `${appUrl}/book`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 32px 30px; text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">${brandName}</div>
              <div style="font-size: 13px; color: ${accentColor}; margin-top: 4px;">Compassionate, Evidence-Based Healthcare</div>
            </td>
          </tr>

          <!-- Confirmation Hero -->
          <tr>
            <td style="padding: 32px 30px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #d1fae5; color: #065f46; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                ✓ Appointment Confirmed
              </div>
              <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 16px 0 8px;">You're All Set, ${data.patientName}</h1>
              <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0;">
                Your upcoming consultation with <strong>${data.doctorName || "Board-Certified Clinician"}</strong> has been confirmed by our clinical desk.
              </p>
            </td>
          </tr>

          <!-- Appointment Detail Box -->
          <tr>
            <td style="padding: 0 30px 24px;">
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 35%;">Service:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${data.serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Date & Time:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: ${primaryColor};">${data.appointmentDate} at ${data.appointmentTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Physician:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${data.doctorName || "Assigned Medical Doctor"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Location:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #0f172a; line-height: 1.4;">
                    ${clinicAddress}<br>
                    <span style="color: #64748b; font-size: 12px;">Validated parking garage on Levels 2-4</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pre-Visit Preparation Instructions -->
          <tr>
            <td style="padding: 0 30px 24px;">
              <h2 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px;">Important Checklist for Your Visit:</h2>
              <ul style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Please arrive <strong>10–15 minutes early</strong> to complete intake check-in.</li>
                <li>Bring a valid <strong>government-issued photo ID</strong> and your <strong>insurance card(s)</strong>.</li>
                <li>Bring a current list of your prescriptions and supplements.</li>
              </ul>
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding: 0 30px 32px; text-align: center;">
              <a href="${portalUrl}" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);">
                View Appointment & Add to Calendar
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 6px;">Need to reschedule or cancel? Please notify us at least 24 hours in advance at <a href="tel:5552345678" style="color: ${primaryColor}; text-decoration: none;">${clinicPhone}</a>.</p>
              <p style="margin: 0;">${brandName} • ${clinicAddress}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Appointment Confirmed - ${brandName}
-----------------------------------
Hello ${data.patientName},

Your appointment for ${data.serviceName} has been confirmed.
- Date & Time: ${data.appointmentDate} at ${data.appointmentTime}
- Provider: ${data.doctorName || "Assigned Medical Doctor"}
- Location: ${clinicAddress}

Checklist:
* Arrive 10-15 minutes early.
* Bring photo ID and insurance card.
* Bring current prescription list.

Need to reschedule? Call us at ${clinicPhone}.
`;

  return { subject, html, text };
}

/**
 * 3. Booking Declined / Rescheduled Proposal Template
 */
export function renderBookingDeclinedEmail(
  data: BaseEmailData & { reason?: string; alternativeSlot?: string }
) {
  const subject = `Update Regarding Your Appointment Request - ${brandName}`;
  const rebookUrl = `${appUrl}/book`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
          
          <tr>
            <td style="background-color: ${primaryColor}; padding: 28px 30px; text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #ffffff;">${brandName}</div>
              <div style="font-size: 13px; color: ${accentColor}; margin-top: 4px;">Clinical Care Coordination</div>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 30px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #fee2e2; color: #991b1b; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase;">
                Reschedule Needed
              </div>
              <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 16px 0 8px;">Important Schedule Update</h1>
              <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0;">
                Dear ${data.patientName}, we are unable to accommodate your requested slot for <strong>${data.serviceName}</strong> on <strong>${data.appointmentDate} at ${data.appointmentTime}</strong>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 4px;">
                <div style="font-size: 13px; font-weight: 700; color: #991b1b;">Reason from Clinical Desk:</div>
                <div style="font-size: 13px; color: #7f1d1d; margin-top: 4px; line-height: 1.5;">
                  ${data.reason || "The requested specialist is in surgery or scheduled for urgent clinical rounds during this time slot."}
                </div>
              </div>
            </td>
          </tr>

          ${
            data.alternativeSlot
              ? `
          <tr>
            <td style="padding: 0 30px 24px;">
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px 20px; border-radius: 8px;">
                <div style="font-size: 13px; font-weight: 700; color: #166534;">Recommended Alternative Slot:</div>
                <div style="font-size: 15px; font-weight: 700; color: ${primaryColor}; margin-top: 4px;">${data.alternativeSlot}</div>
              </div>
            </td>
          </tr>
          `
              : ""
          }

          <tr>
            <td style="padding: 0 30px 32px; text-align: center;">
              <a href="${rebookUrl}" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
                Select an Alternative Time Slot
              </a>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0;">Prefer to speak with someone? Call us directly at <a href="tel:5552345678" style="color: ${primaryColor}; text-decoration: none;">${clinicPhone}</a>.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Update Regarding Your Appointment Request - ${brandName}
-------------------------------------------------------
Dear ${data.patientName},

We are unable to confirm your requested slot for ${data.serviceName} on ${data.appointmentDate} at ${data.appointmentTime}.
Reason: ${data.reason || "Provider schedule full"}

Please visit ${rebookUrl} to choose another time or call our desk at ${clinicPhone}.
`;

  return { subject, html, text };
}

/**
 * 4. Appointment Reminder (24 Hours Before) Template
 */
export function renderAppointmentReminderEmail(data: BaseEmailData) {
  const subject = `⏰ Reminder: Your Appointment Tomorrow at ${data.appointmentTime} - ${brandName}`;
  const confirmUrl = `${appUrl}/contact`;
  const rescheduleUrl = `${appUrl}/book`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 28px 30px; text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #ffffff;">${brandName}</div>
              <div style="font-size: 13px; color: ${accentColor}; margin-top: 4px;">Upcoming Visit Reminder</div>
            </td>
          </tr>

          <!-- Reminder Hero -->
          <tr>
            <td style="padding: 32px 30px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                ⏰ Reminder: Tomorrow at ${data.appointmentTime}
              </div>
              <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 16px 0 8px;">See You Tomorrow, ${data.patientName}</h1>
              <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0;">
                This is a friendly reminder for your upcoming appointment scheduled for <strong>tomorrow, ${data.appointmentDate}</strong>.
              </p>
            </td>
          </tr>

          <!-- Highlight Box -->
          <tr>
            <td style="padding: 0 30px 24px;">
              <div style="background-color: #f0fdf4; border-left: 4px solid ${primaryColor}; padding: 16px 20px; border-radius: 4px;">
                <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${data.serviceName} with ${data.doctorName || "Clinical Provider"}</div>
                <div style="font-size: 14px; font-weight: 600; color: ${primaryColor}; margin-top: 4px;">Tomorrow • ${data.appointmentTime} (Duration: ${data.durationMinutes || 30} mins)</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">📍 ${clinicAddress}</div>
              </div>
            </td>
          </tr>

          <!-- Quick Actions & Directions -->
          <tr>
            <td style="padding: 0 30px 28px;">
              <h2 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px;">Directions & Parking:</h2>
              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
                Free validated parking is located in the adjacent Evergreen Medical Pavilion structure. Take the elevator to the 4th floor.
              </p>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <a href="${confirmUrl}" style="display: block; width: 80%; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 0; border-radius: 8px; text-align: center;">
                      ✓ Confirm My Attendance
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${rescheduleUrl}" style="font-size: 13px; color: #64748b; text-decoration: underline;">
                      Need to reschedule or running late?
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0;">Questions? Call our front desk at <a href="tel:5552345678" style="color: ${primaryColor}; text-decoration: none;">${clinicPhone}</a>.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Appointment Reminder: Tomorrow at ${data.appointmentTime} - ${brandName}
----------------------------------------------------------------------
Hello ${data.patientName},

Reminder for your appointment tomorrow, ${data.appointmentDate} at ${data.appointmentTime}:
- Service: ${data.serviceName}
- Clinician: ${data.doctorName || "Clinical Provider"}
- Location: ${clinicAddress}

Validated parking is available in the pavilion garage.
Need to reschedule? Call us at ${clinicPhone}.
`;

  return { subject, html, text };
}

/**
 * 5. Cancellation Confirmation Email Template
 */
export function renderBookingCancelledEmail(data: BaseEmailData) {
  const subject = `Appointment Cancelled - ${brandName}`;
  const rebookUrl = `${appUrl}/book`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
          
          <tr>
            <td style="background-color: #64748b; padding: 28px 30px; text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #ffffff;">${brandName}</div>
              <div style="font-size: 13px; color: #e2e8f0; margin-top: 4px;">Appointment Cancellation Notice</div>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 30px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #f1f5f9; color: #475569; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase;">
                Appointment Cancelled
              </div>
              <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 16px 0 8px;">Cancellation Confirmed</h1>
              <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0;">
                Dear ${data.patientName}, your appointment for <strong>${data.serviceName}</strong> previously scheduled for <strong>${data.appointmentDate} at ${data.appointmentTime}</strong> has been cancelled.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px 24px; text-align: center;">
              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
                Whenever you are ready to reschedule, you can choose a convenient slot with our online booking system:
              </p>
              <a href="${rebookUrl}" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
                Book a New Appointment
              </a>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0;">Questions? Call our front desk at <a href="tel:5552345678" style="color: ${primaryColor}; text-decoration: none;">${clinicPhone}</a>.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Appointment Cancelled - ${brandName}
------------------------------------
Hello ${data.patientName},

Your appointment for ${data.serviceName} on ${data.appointmentDate} at ${data.appointmentTime} has been cancelled.
When ready to reschedule, visit ${rebookUrl} or call ${clinicPhone}.
`;

  return { subject, html, text };
}
