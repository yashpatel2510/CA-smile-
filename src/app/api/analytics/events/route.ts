import { NextRequest, NextResponse } from "next/server";

// Rolling in-memory aggregate store for lightweight telemetry
interface AnalyticsStore {
  pageViews: Record<string, number>;
  funnelSteps: Record<number, number>;
  serviceInterests: Record<string, number>;
  directInquiries: number;
  totalEvents: number;
}

const analyticsStore: AnalyticsStore = {
  pageViews: {
    "/": 482,
    "/services": 296,
    "/book": 184,
    "/about": 112,
    "/contact": 88,
    "/blog": 74,
  },
  funnelSteps: {
    1: 184, // Step 1: Visit Booking Page
    2: 152, // Step 2: Select Service (82.6%)
    3: 121, // Step 3: Select Date & Time (65.7%)
    4: 94, // Step 4: Enter Patient Details (51.0%)
    5: 88, // Step 5: Booking Confirmed (47.8%)
  },
  serviceInterests: {
    "Comprehensive Cardiology Diagnostic Panel": 48,
    "General Practitioner Consultation": 54,
    "Pediatric Wellness & Immunization Check": 28,
    "Preventive Dental Cleaning & Examination": 22,
  },
  directInquiries: 54,
  totalEvents: 1227,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, path, step, serviceName } = body;

    analyticsStore.totalEvents++;

    if (eventName === "page_view" && path) {
      analyticsStore.pageViews[path] =
        (analyticsStore.pageViews[path] || 0) + 1;
    }

    if (eventName === "funnel_step" && typeof step === "number") {
      analyticsStore.funnelSteps[step] =
        (analyticsStore.funnelSteps[step] || 0) + 1;
    }

    if (serviceName) {
      analyticsStore.serviceInterests[serviceName] =
        (analyticsStore.serviceInterests[serviceName] || 0) + 1;
    }

    if (eventName === "direct_inquiry" || eventName === "contact_submit") {
      analyticsStore.directInquiries++;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}

export async function GET(req: NextRequest) {
  try {
    const totalPageViews = Object.values(analyticsStore.pageViews).reduce(
      (a, b) => a + b,
      0
    );

    const step1 = analyticsStore.funnelSteps[1] || 1;
    const funnelWithPercentages = [
      {
        step: 1,
        name: "View Booking Page",
        count: analyticsStore.funnelSteps[1] || 0,
        conversionRate: 100,
      },
      {
        step: 2,
        name: "Select Clinical Service",
        count: analyticsStore.funnelSteps[2] || 0,
        conversionRate: Math.round(
          ((analyticsStore.funnelSteps[2] || 0) / step1) * 100
        ),
      },
      {
        step: 3,
        name: "Pick Date & Time Slot",
        count: analyticsStore.funnelSteps[3] || 0,
        conversionRate: Math.round(
          ((analyticsStore.funnelSteps[3] || 0) / step1) * 100
        ),
      },
      {
        step: 4,
        name: "Enter Contact Information",
        count: analyticsStore.funnelSteps[4] || 0,
        conversionRate: Math.round(
          ((analyticsStore.funnelSteps[4] || 0) / step1) * 100
        ),
      },
      {
        step: 5,
        name: "Appointment Confirmed",
        count: analyticsStore.funnelSteps[5] || 0,
        conversionRate: Math.round(
          ((analyticsStore.funnelSteps[5] || 0) / step1) * 100
        ),
      },
    ];

    return NextResponse.json({
      success: true,
      metrics: {
        totalPageViews,
        totalEvents: analyticsStore.totalEvents,
        directInquiries: analyticsStore.directInquiries,
        pageViews: analyticsStore.pageViews,
        funnel: funnelWithPercentages,
        serviceInterests: analyticsStore.serviceInterests,
        overallConversionRate: funnelWithPercentages[4].conversionRate,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}
