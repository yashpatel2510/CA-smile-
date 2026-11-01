import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import {
  renderBookingRequestReceivedEmail,
  renderBookingConfirmedEmail,
  renderBookingDeclinedEmail,
  renderAppointmentReminderEmail,
  renderBookingCancelledEmail,
} from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateType, sampleData } = body;
    const recipient = body.toEmail || body.to;

    if (!recipient) {
      return NextResponse.json(
        { success: false, message: "Target recipient email is required" },
        { status: 400 }
      );
    }

    const data = {
      patientName: sampleData?.patientName || "Eleanor Pena",
      serviceName:
        sampleData?.serviceName || "Comprehensive Dental Examination & Consultation",
      appointmentDate: sampleData?.appointmentDate || "Wednesday, Sep 23, 2026",
      appointmentTime: sampleData?.appointmentTime || "10:30 AM",
      doctorName: sampleData?.doctorName || "Dr. Deep A Patel, BDS",
      servicePrice: sampleData?.servicePrice || "300.00",
      durationMinutes: sampleData?.durationMinutes || 45,
      reason:
        sampleData?.reason ||
        "The requested specialist is in emergency surgical rounds during this time slot.",
      alternativeSlot:
        sampleData?.alternativeSlot || "Thursday, Sep 24, 2026 at 02:00 PM",
    };

    let email;
    switch (templateType) {
      case "booking-received":
        email = renderBookingRequestReceivedEmail(data);
        break;
      case "booking-confirmed":
        email = renderBookingConfirmedEmail(data);
        break;
      case "booking-declined":
        email = renderBookingDeclinedEmail(data);
        break;
      case "appointment-reminder":
        email = renderAppointmentReminderEmail(data);
        break;
      case "booking-cancelled":
        email = renderBookingCancelledEmail(data);
        break;
      default:
        email = renderBookingConfirmedEmail(data);
    }

    const sendResult = await sendEmail({
      to: recipient,
      subject: `[TEST PREVIEW] ${email.subject}`,
      html: email.html,
      text: email.text,
    });

    return NextResponse.json({
      success: true,
      message: `Test email dispatched to ${recipient}`,
      sendResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to dispatch test email",
      },
      { status: 500 }
    );
  }
}
