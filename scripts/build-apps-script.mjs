import fs from "fs";

async function run() {
  const res = await fetch("http://localhost:3000/api/admin/google-sheets");
  const data = await res.json();

  const contactsRows = data.contacts.map((c, i) => 
    JSON.stringify([
      i + 1,
      `#${c.patientNumber ?? c.rowNumber ?? (i + 1)}`,
      c.fullName || "Valued Patient",
      c.whatsappPhone || "—",
      c.email || "—",
      c.visits || 1
    ])
  ).join(",\n    ");

  const bookingsRows = data.bookings.map((b, i) => 
    JSON.stringify([
      i + 1,
      b.patientNo || `#${i + 1}`,
      b.patientName || "Valued Patient",
      b.phone || "—",
      b.service || "General Consultation",
      b.dateTime || "Scheduled",
      b.doctor || "Dr. Sankar",
      b.status || "PENDING"
    ])
  ).join(",\n    ");

  const feedbackRows = (data.feedback || []).map((f, i) => 
    JSON.stringify([
      i + 1,
      f.feedbackId || `FB-${i + 1}`,
      f.authorName || "Anonymous",
      f.rating || "5 ★",
      f.comment || "—",
      f.treatment || "Dental Care",
      f.source || "Google Maps",
      f.date || "Recent",
      f.status || "APPROVED"
    ])
  ).join(",\n    ");

  const script = `/**
 * ==============================================================================
 * SmileCraft Dental Studio — 1-Click Google Sheet Populator & Live Sync Engine
 * Target Sheet: https://docs.google.com/spreadsheets/d/1qVZy6blS90dD3-PIK1LH_neDfO1vLy3wV8XMWXy9Rtw/edit
 * ==============================================================================
 */

var SPREADSHEET_ID = "1qVZy6blS90dD3-PIK1LH_neDfO1vLy3wV8XMWXy9Rtw";

/**
 * ⚡ 1. CLICK RUN (▶️) ON THIS FUNCTION TO POPULATE YOUR SHEET IMMEDIATELY!
 *    Populates Contacts (58 patients), Bookings (97 appointments with Patient No. and NO Amount),
 *    and Feedback directly into your Google Sheet tabs with green headers!
 */
function populateSheetNow() {
  var ss = getSpreadsheet();
  if (!ss) {
    throw new Error("Could not open spreadsheet. Please ensure this script is inside Extensions > Apps Script in your Google Sheet.");
  }

  // 1. Contacts Data
  var contacts = [
    ["#", "Patient No.", "Full Name", "WhatsApp Phone", "Email", "Visits"],
    ${contactsRows}
  ];
  writeRawDataToSheet(ss, "Contacts", contacts);

  // 2. Bookings Data (No Amount, Patient No. Included)
  var bookings = [
    ["#", "Patient No.", "Full Name", "WhatsApp Phone", "Service", "Date & Slot", "Doctor", "Status"],
    ${bookingsRows}
  ];
  writeRawDataToSheet(ss, "Bookings", bookings);

  // 3. Feedback Data
  var feedback = [
    ["#", "Feedback ID", "Patient / Author", "Rating", "Review", "Treatment", "Source", "Date", "Status"],
    ${feedbackRows}
  ];
  writeRawDataToSheet(ss, "Feedback", feedback);

  try {
    ss.toast("✅ Successfully populated " + (contacts.length - 1) + " Patients & " + (bookings.length - 1) + " Bookings!", "Clinic Live Sync", 6);
  } catch (e) {}

  return {
    success: true,
    message: "Populated " + (contacts.length - 1) + " Patients and " + (bookings.length - 1) + " Bookings directly into Google Sheets!"
  };
}

/**
 * 2. Adds "🏥 Clinic Live Sync" menu in Google Sheets
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("🏥 Clinic Live Sync")
      .addItem("⚡ Populate / Refresh Sheet Now", "populateSheetNow")
      .addToUi();
  } catch (e) {}
}

/**
 * Helper to write 2D array data to sheet tab with green header styling
 */
function writeRawDataToSheet(ss, sheetName, data) {
  if (!data || data.length === 0) return;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    var defaultSheet = ss.getSheetByName("Sheet1");
    if (defaultSheet && defaultSheet.getLastRow() === 0 && sheetName === "Contacts") {
      defaultSheet.setName("Contacts");
      sheet = defaultSheet;
    } else {
      sheet = ss.insertSheet(sheetName);
    }
  }

  sheet.clear();
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);

  // Style Header Row (Dark green background, white bold text)
  var header = sheet.getRange(1, 1, 1, data[0].length);
  header.setBackground("#0F9D58");
  header.setFontColor("#FFFFFF");
  header.setFontWeight("bold");
  header.setHorizontalAlignment("center");
  header.setVerticalAlignment("middle");
  sheet.setFrozenRows(1);

  // Auto-resize columns
  try {
    for (var col = 1; col <= data[0].length; col++) {
      sheet.autoResizeColumn(col);
    }
  } catch (e) {}
}

/**
 * Converts array of JSON objects to 2D array and writes to sheet
 */
function writeArrayToSheet(ss, sheetName, rows) {
  if (!rows || rows.length === 0) return;
  var headerMap = {
    rowNumber: "#",
    patientNumber: "Patient No.",
    patientNo: "Patient No.",
    fullName: "Full Name",
    patientName: "Full Name",
    whatsappPhone: "WhatsApp Phone",
    phone: "WhatsApp Phone",
    email: "Email",
    visits: "Visits",
    service: "Service",
    dateTime: "Date & Slot",
    doctor: "Doctor",
    status: "Status",
    feedbackId: "Feedback ID",
    authorName: "Patient / Author",
    rating: "Rating",
    comment: "Review",
    treatment: "Treatment",
    source: "Source",
    date: "Date"
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
  writeRawDataToSheet(ss, sheetName, data);
}

/**
 * Helper to get the target spreadsheet
 */
function getSpreadsheet() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  try {
    if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {}
  return null;
}

/**
 * 3. Handles Web App GET requests
 */
function doGet(e) {
  try {
    if (e && e.parameter && (e.parameter.sync === "1" || e.parameter.action === "SYNC_ALL")) {
      var result = populateSheetNow();
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({
      status: "ACTIVE",
      success: true,
      service: "SmileCraft Live Scanner",
      spreadsheetId: SPREADSHEET_ID
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 4. Handles Web App POST requests (from Admin Panel 'Sync Now' or new booking hooks)
 */
function doPost(e) {
  try {
    var contents = null;
    if (e && e.postData && e.postData.contents) {
      try { contents = JSON.parse(e.postData.contents); } catch (pe) {}
    }

    if (contents && (contents.action === "PING" || contents.ping)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        status: "ACTIVE",
        message: "Google Apps Script Webhook is active and responding"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (contents && contents.sheets) {
      var ss = getSpreadsheet();
      if (ss) {
        if (contents.sheets.Contacts) writeArrayToSheet(ss, "Contacts", contents.sheets.Contacts);
        if (contents.sheets.Bookings) writeArrayToSheet(ss, "Bookings", contents.sheets.Bookings);
        if (contents.sheets.Feedback) writeArrayToSheet(ss, "Feedback", contents.sheets.Feedback);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: "Synchronized directly via Webhook payload!"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var result = populateSheetNow();
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

  fs.writeFileSync("scripts/google-apps-script-latest.js", script, "utf-8");
  console.log("Success! File written: scripts/google-apps-script-latest.js, lines:", script.split("\n").length);
}

run();
