import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import { getReviewsStoreData } from "@/lib/reviews-store";

export interface GoogleSheetConfig {
  webhookUrl: string;
  spreadsheetUrl: string;
  spreadsheetId: string;
  autoSyncOnBooking: boolean;
  syncStatus: "CONNECTED" | "DISCONNECTED" | "SYNCING" | "ERROR";
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  totalRowsSynced: number;
}

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "google-sheet-config.json");

export function getGoogleSheetConfig(): GoogleSheetConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading Google Sheet config:", err);
  }

  return {
    webhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL || "",
    spreadsheetUrl: process.env.GOOGLE_SPREADSHEET_URL || "",
    spreadsheetId: "",
    autoSyncOnBooking: true,
    syncStatus: process.env.GOOGLE_SHEETS_WEBHOOK_URL ? "CONNECTED" : "DISCONNECTED",
    lastSyncedAt: null,
    lastSyncError: null,
    totalRowsSynced: 0,
  };
}

export function saveGoogleSheetConfig(updates: Partial<GoogleSheetConfig>): GoogleSheetConfig {
  const current = getGoogleSheetConfig();
  const updated: GoogleSheetConfig = { ...current, ...updates };

  // Auto-extract spreadsheetId from spreadsheetUrl if present
  if (updated.spreadsheetUrl && !updated.spreadsheetId) {
    const match = updated.spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      updated.spreadsheetId = match[1];
    }
  }

  // Update status based on webhookUrl
  if (!updated.webhookUrl || !updated.webhookUrl.trim().startsWith("http")) {
    updated.syncStatus = "DISCONNECTED";
    updated.lastSyncError = null;
  }

  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving Google Sheet config:", err);
  }

  return updated;
}

/**
 * Gather all live patient records, appointments, and reviews from database
 */
export async function gatherAllClinicData() {
  const clinic = await prisma.clinic.findFirst().catch(() => null);
  const clinicName = clinic?.name || "SmileCraft Dental Studio";

  // 1. Patients (Contacts)
  let patientsList: any[] = [];
  try {
    patientsList = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        appointments: { include: { service: true } },
        treatments: true,
        whatsappConversations: { take: 1 },
      },
    });
  } catch {}

  const inMemAppts = inMemoryStore.getAppointments();
  const existingPhones = new Set(patientsList.map((p) => (p.phone || "").replace(/\D/g, "")));
  for (const a of inMemAppts) {
    const clean = (a.patient?.phone || "").replace(/\D/g, "");
    if (clean && !existingPhones.has(clean)) {
      existingPhones.add(clean);
      patientsList.push({
        id: `pat-${clean}`,
        firstName: a.patient?.firstName || "Valued",
        lastName: a.patient?.lastName || "Patient",
        email: a.patient?.email,
        phone: a.patient?.phone,
        createdAt: a.createdAt,
        appointments: [a],
        treatments: [],
      });
    }
  }

  const contacts = patientsList.map((p, idx) => {
    const visits = p.appointments?.length || 0;

    return {
      rowNumber: idx + 1,
      patientNumber: idx + 1,
      fullName: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Valued Patient",
      whatsappPhone: p.phone || "—",
      email: p.email || "—",
      visits,
    };
  });

  // 2. Bookings
  let appointmentsList: any[] = [];
  try {
    appointmentsList = await prisma.appointment.findMany({
      orderBy: { startTime: "desc" },
      include: { patient: true, service: true, staffUser: true },
    });
  } catch {}

  if (appointmentsList.length === 0) {
    appointmentsList = inMemoryStore.getAppointments();
  }

  // Create lookup for Patient Number
  const patientNumberMap = new Map<string, number>();
  patientsList.forEach((p, idx) => {
    const pNum = idx + 1;
    if (p.id) patientNumberMap.set(p.id, pNum);
    const clean = (p.phone || "").replace(/\D/g, "");
    if (clean) patientNumberMap.set(clean, pNum);
  });

  const bookings = appointmentsList.map((a, idx) => {
    const patientName =
      a.patientName ||
      (a.patient ? `${a.patient.firstName || ""} ${a.patient.lastName || ""}`.trim() : "Valued Patient");
    const startDate = a.startTime ? new Date(a.startTime) : new Date();

    const clean = (a.patient?.phone || a.phone || "").replace(/\D/g, "");
    const pNum =
      (a.patientId && patientNumberMap.get(a.patientId)) ||
      (clean && patientNumberMap.get(clean)) ||
      (idx + 1);
    const patientNo = `#${pNum}`;

    return {
      rowNumber: idx + 1,
      patientNo,
      patientName: patientName || "Valued Patient",
      phone: a.patient?.phone || "—",
      service: a.service?.name || a.reason || "General Consultation",
      dateTime: startDate.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      doctor: a.preferredDoctor || a.staffUser?.name || "Dr. Sankar",
      status: a.status || "PENDING",
    };
  });

  // 3. Feedback
  const reviewsStore = getReviewsStoreData();
  const feedback = (reviewsStore.reviews || []).map((r, idx) => ({
    rowNumber: idx + 1,
    feedbackId: r.id || `FB-${idx + 1}`,
    authorName: r.authorName || "Anonymous",
    rating: `${r.rating} ★`,
    comment: r.comment || "—",
    treatment: r.treatment || "Dental Care",
    source: r.source || "Google Maps",
    date: r.date || "Recent",
    status: r.status || "APPROVED",
  }));

  return { clinicName, contacts, bookings, feedback };
}

/**
 * Perform a full sync of all patient data, bookings, and feedback to the user's Google Sheet
 */
export async function syncAllToGoogleSheet(): Promise<{
  success: boolean;
  message: string;
  totalSynced?: number;
}> {
  const config = getGoogleSheetConfig();
  if (!config.webhookUrl || !config.webhookUrl.startsWith("http")) {
    return {
      success: false,
      message: "Google Sheet Webhook URL is not configured. Please paste your Google Apps Script URL.",
    };
  }

  try {
    saveGoogleSheetConfig({ syncStatus: "SYNCING" });

    const payloadData = await gatherAllClinicData();
    const payload = {
      action: "SYNC_ALL",
      clinicName: payloadData.clinicName,
      timestamp: new Date().toISOString(),
      sheets: {
        Contacts: payloadData.contacts,
        Bookings: payloadData.bookings,
        Feedback: payloadData.feedback,
      },
    };

    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // Google Apps Script can take up to 8s on first cold run
      signal: AbortSignal.timeout(12000),
    });

    const text = await response.text();
    let resJson: any = null;
    try {
      resJson = JSON.parse(text);
    } catch {}

    if (
      text.includes("Script function not found") ||
      text.includes("Page not found") ||
      text.includes("Sorry, unable to open the file") ||
      (text.includes("<!DOCTYPE") && (!resJson || !resJson.success)) ||
      response.status >= 400
    ) {
      if (text.includes("Script function not found")) {
        throw new Error(
          "Script function not found in Google Apps Script. In your Google Sheet, click Extensions > Apps Script, paste the updated code, save (Cmd+S), then click Deploy > Manage deployments > Edit ✏️ > Version: 'New version' > Deploy."
        );
      }
      if (response.status === 403 || text.includes("403") || text.includes("Forbidden")) {
        throw new Error(
          "Access Denied (403). In your Google Sheet Apps Script, click Deploy > Manage deployments > Edit ✏️ > ensure 'Who has access' is set to 'Anyone' > Deploy."
        );
      }
      if (text.includes("Page not found") || text.includes("Sorry, unable to open the file")) {
        throw new Error(
          "Google returned 'Page not found'. In your Google Sheet Apps Script, click Deploy > Manage deployments > Edit ✏️ > ensure 'Who has access' is set to 'Anyone' > Deploy and copy the Web App URL."
        );
      }
      throw new Error(
        "Google Webhook returned an error page. Ensure 'Who has access' is set to 'Anyone' and deploy a 'New version'."
      );
    }

    if (resJson && resJson.success === false) {
      throw new Error(resJson.error || "Google Apps Script reported an error while updating the sheet.");
    }

    const totalSynced =
      payloadData.contacts.length + payloadData.bookings.length + payloadData.feedback.length;

    saveGoogleSheetConfig({
      syncStatus: "CONNECTED",
      lastSyncedAt: new Date().toISOString(),
      lastSyncError: null,
      totalRowsSynced: totalSynced,
    });

    return {
      success: true,
      message: `Successfully synchronized ${payloadData.contacts.length} patients and ${payloadData.bookings.length} bookings directly into your Google Sheet!`,
      totalSynced,
    };
  } catch (err: any) {
    console.error("Google Sheet Sync Error:", err);
    saveGoogleSheetConfig({
      syncStatus: "ERROR",
      lastSyncError: err.message || "Failed to reach Google Sheet Webhook",
    });

    return {
      success: false,
      message: `Sync failed: ${err.message || "Could not connect to Google Sheet Webhook URL"}.`,
    };
  }
}

/**
 * Verify whether Google Sheet Webhook is live and responding
 */
export async function verifyGoogleSheetConnection(url?: string): Promise<{
  connected: boolean;
  message: string;
}> {
  const config = getGoogleSheetConfig();
  const targetUrl = url ? url.trim() : config.webhookUrl;

  if (!targetUrl || !targetUrl.startsWith("http")) {
    saveGoogleSheetConfig({
      syncStatus: "DISCONNECTED",
      lastSyncError: "Google Sheet Webhook URL is not configured.",
    });
    return {
      connected: false,
      message: "Webhook URL is empty. Please paste your Google Apps Script Web App URL.",
    };
  }

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: { Accept: "application/json, text/html" },
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();

    if (text.includes("Script function not found")) {
      const errMsg =
        "Script function not found in Google Apps Script. In your Google Sheet, click Extensions > Apps Script, paste the updated code, save (Cmd+S), then click Deploy > Manage deployments > Edit ✏️ > Version: 'New version' > Deploy.";
      saveGoogleSheetConfig({
        syncStatus: "ERROR",
        lastSyncError: errMsg,
      });
      return { connected: false, message: errMsg };
    }

    if (res.status === 403 || (text.includes("403") && text.includes("Forbidden"))) {
      const errMsg =
        "Access Denied (403). In your Google Sheet Apps Script, click Deploy > Manage deployments > Edit ✏️ > ensure 'Who has access' is set to 'Anyone' > Deploy.";
      saveGoogleSheetConfig({
        syncStatus: "ERROR",
        lastSyncError: errMsg,
      });
      return { connected: false, message: errMsg };
    }

    if (text.includes("Page not found") || text.includes("Sorry, unable to open the file")) {
      const errMsg =
        "Google returned 'Page not found'. Ensure 'Who has access' is set to 'Anyone' and copy the current Web App URL ending in /exec.";
      saveGoogleSheetConfig({
        syncStatus: "ERROR",
        lastSyncError: errMsg,
      });
      return { connected: false, message: errMsg };
    }

    // Try parsing JSON from GET
    try {
      const json = JSON.parse(text);
      if (json.status === "ACTIVE" || json.success === true) {
        saveGoogleSheetConfig({
          syncStatus: "CONNECTED",
          lastSyncError: null,
        });
        return {
          connected: true,
          message: "Google Sheet Webhook is active and connected!",
        };
      }
    } catch {}

    // Test POST ping fallback
    try {
      const postRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PING" }),
        signal: AbortSignal.timeout(8000),
      });
      const postText = await postRes.text();
      if (postText.includes("Script function not found")) {
        const errMsg =
          "Script function not found in Google Apps Script. In your Google Sheet, click Extensions > Apps Script, paste the updated code, save (Cmd+S), then click Deploy > Manage deployments > Edit ✏️ > Version: 'New version' > Deploy.";
        saveGoogleSheetConfig({
          syncStatus: "ERROR",
          lastSyncError: errMsg,
        });
        return { connected: false, message: errMsg };
      }
      try {
        const postJson = JSON.parse(postText);
        if (postJson.success === true) {
          saveGoogleSheetConfig({
            syncStatus: "CONNECTED",
            lastSyncError: null,
          });
          return {
            connected: true,
            message: "Google Sheet Webhook is active and connected!",
          };
        }
      } catch {}
    } catch {}

    const fallbackMsg =
      "Google Webhook returned an unverified response. Make sure your Apps Script is deployed as Web App with 'Who has access: Anyone'.";
    saveGoogleSheetConfig({
      syncStatus: "ERROR",
      lastSyncError: fallbackMsg,
    });
    return { connected: false, message: fallbackMsg };
  } catch (err: any) {
    const errText = err.message || "Connection timed out";
    saveGoogleSheetConfig({
      syncStatus: "ERROR",
      lastSyncError: `Connection failed: ${errText}`,
    });
    return {
      connected: false,
      message: `Failed to connect to Google Sheet Webhook: ${errText}`,
    };
  }
}

/**
 * Automatically append a single new patient / booking to Google Sheet in real-time
 */
export async function appendPatientToGoogleSheet(patient: {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  service?: string;
  doctor?: string;
  dateTime?: string;
  amount?: number;
  source?: string;
}) {
  const config = getGoogleSheetConfig();
  if (!config.webhookUrl || !config.webhookUrl.startsWith("http") || !config.autoSyncOnBooking) {
    return;
  }

  try {
    const payload = {
      action: "APPEND_ROW",
      timestamp: new Date().toISOString(),
      contact: {
        patientNumber: 1,
        fullName: patient.name,
        whatsappPhone: patient.phone,
        email: patient.email || "—",
        visits: 1,
      },
      booking: {
        patientNo: patient.id ? `#${patient.id.slice(-4)}` : "#1",
        patientName: patient.name,
        phone: patient.phone,
        service: patient.service || "General Consultation",
        dateTime: patient.dateTime || new Date().toLocaleString("en-US"),
        doctor: patient.doctor || "Dr. Sankar",
        status: "PENDING",
      },
    };

    await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });
  } catch (err) {
    console.warn("Background Google Sheet live append notice:", err);
  }
}

/**
 * 1-Click Copy-Paste Google Apps Script
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * CA SMILE Dental Clinic — Permanent Google Sheets Live Sync Engine
 * ==============================================================================
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Full Sync
    if (data.sheets) {
      if (data.sheets.Contacts) writeTab(ss, "Contacts", data.sheets.Contacts);
      if (data.sheets.Bookings) writeTab(ss, "Bookings", data.sheets.Bookings);
      if (data.sheets.Feedback) writeTab(ss, "Feedback", data.sheets.Feedback);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Synchronized successfully!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Real-time Append (New Booking)
    if (data.action === "APPEND_ROW") {
      if (data.booking) {
        var bSheet = getOrCreateSheet(ss, "Bookings");
        bSheet.appendRow([
          bSheet.getLastRow(),
          data.booking.patientNo || "#1",
          data.booking.patientName || "",
          data.booking.phone || "",
          data.booking.service || "",
          data.booking.dateTime || "",
          data.booking.doctor || "",
          data.booking.status || "PENDING"
        ]);
      }
      if (data.contact) {
        var cSheet = getOrCreateSheet(ss, "Contacts");
        cSheet.appendRow([
          cSheet.getLastRow(),
          data.contact.patientNumber || cSheet.getLastRow(),
          data.contact.fullName || "",
          data.contact.whatsappPhone || "",
          data.contact.email || "",
          data.contact.visits || 1
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Row appended successfully!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Ping / Connection Test
    return ContentService.createTextOutput(JSON.stringify({ success: true, status: "ACTIVE" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ACTIVE", success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function writeTab(ss, name, rows) {
  if (!rows || rows.length === 0) return;
  var sheet = getOrCreateSheet(ss, name);
  sheet.clear();

  var headerMap = {
    rowNumber: "#",
    patientNo: "Patient No.",
    patientNumber: "Patient No.",
    fullName: "Full Name",
    patientName: "Full Name",
    whatsappPhone: "WhatsApp Phone",
    phone: "WhatsApp Phone",
    email: "Email",
    visits: "Visits",
    service: "Service",
    dateTime: "Date & Slot",
    doctor: "Doctor",
    status: "Status"
  };

  var rawKeys = Object.keys(rows[0]);
  var displayHeaders = rawKeys.map(function(k) { return headerMap[k] || k; });
  var data = [displayHeaders];
  for (var i = 0; i < rows.length; i++) {
    var row = [];
    for (var j = 0; j < rawKeys.length; j++) {
      row.push(rows[i][rawKeys[j]] != null ? rows[i][rawKeys[j]] : "");
    }
    data.push(row);
  }

  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);

  // Style Header Row (Dark green background, white bold text)
  var header = sheet.getRange(1, 1, 1, data[0].length);
  header.setBackground("#0F9D58");
  header.setFontColor("#FFFFFF");
  header.setFontWeight("bold");
  header.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  try {
    for (var c = 1; c <= data[0].length; c++) {
      sheet.autoResizeColumn(c);
    }
  } catch (e) {}
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    var def = ss.getSheetByName("Sheet1");
    if (def && def.getLastRow() === 0 && name === "Contacts") {
      def.setName("Contacts");
      sheet = def;
    } else {
      sheet = ss.insertSheet(name);
    }
  }
  return sheet;
}
`;

export function getLatestAppsScriptCode(): string {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "google-apps-script-latest.js");
    if (fs.existsSync(scriptPath)) {
      return fs.readFileSync(scriptPath, "utf-8");
    }
  } catch {}
  return GOOGLE_APPS_SCRIPT_CODE;
}

