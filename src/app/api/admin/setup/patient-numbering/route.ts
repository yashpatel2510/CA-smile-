import { NextResponse } from "next/server";
import {
  getPatientNumberingConfig,
  savePatientNumberingConfig,
  getNextPatientCode,
  formatPatientCode,
} from "@/lib/patient-numbering-store";

export async function GET() {
  try {
    const config = getPatientNumberingConfig();
    const nextCode = getNextPatientCode(config);

    return NextResponse.json({
      success: true,
      data: {
        enableCustomFormat: config.enableCustomFormat,
        prefix: config.prefix,
        includeYear: config.includeYear,
        yearType: config.yearType,
        resetEachYear: config.resetEachYear,
        digitWidth: config.digitWidth,
        separator: config.separator,
        startingNumber: config.startingNumber,
        currentCounter: config.currentCounter,
        nextCode,
      },
    });
  } catch (error: any) {
    console.error("Error fetching patient numbering config:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load patient numbering config" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      enableCustomFormat,
      prefix,
      includeYear,
      yearType,
      resetEachYear,
      digitWidth,
      separator,
      startingNumber,
    } = body;

    const current = getPatientNumberingConfig();

    const updated = savePatientNumberingConfig({
      enableCustomFormat:
        typeof enableCustomFormat === "boolean" ? enableCustomFormat : current.enableCustomFormat,
      prefix: typeof prefix === "string" ? prefix : current.prefix,
      includeYear: typeof includeYear === "boolean" ? includeYear : current.includeYear,
      yearType: yearType === "fiscal" ? "fiscal" : "calendar",
      resetEachYear:
        typeof resetEachYear === "boolean" ? resetEachYear : current.resetEachYear,
      digitWidth: Number(digitWidth) || current.digitWidth,
      separator: typeof separator === "string" ? separator : current.separator,
      startingNumber:
        typeof startingNumber === "number" ? startingNumber : current.startingNumber,
    });

    const nextCode = getNextPatientCode(updated);

    return NextResponse.json({
      success: true,
      message: "Patient numbering settings saved successfully.",
      data: {
        ...updated,
        nextCode,
      },
    });
  } catch (error: any) {
    console.error("Error saving patient numbering config:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save patient numbering config" },
      { status: 500 }
    );
  }
}
