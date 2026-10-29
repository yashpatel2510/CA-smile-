/**
 * ==============================================================================
 * SmileCraft Dental Studio — Google Sheets Automatic Scanner & Sync Engine
 * Target Sheet: https://docs.google.com/spreadsheets/d/1qVZy6blS90dD3-PIK1LH_neDfO1vLy3wV8XMWXy9Rtw/edit
 * ==============================================================================
 */

var SPREADSHEET_ID = "1qVZy6blS90dD3-PIK1LH_neDfO1vLy3wV8XMWXy9Rtw";
var API_BASE_URL = "http://localhost:3000";

/**
 * 1. Automatically adds a custom menu directly inside your Google Sheet
 *    When you open the sheet, you will see a "🏥 Clinic Live Sync" menu at the top!
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("🏥 Clinic Live Sync")
      .addItem("⚡ Start 1-Minute Auto-Scanner", "setupAutomaticScanner")
      .addItem("🔄 Scan & Sync Data Now", "syncAllPatientsFromClinic")
      .addSeparator()
      .addItem("🛑 Stop Auto-Scanner", "disableAutomaticScanner")
      .addToUi();
  } catch (e) {
    Logger.log("Menu initialization: " + e);
  }
}

/**
 * 2. Setup Background Automatic Scanner (RUN THIS ONCE!)
 *    Automatically scans and syncs clinic data every 1 minute in the background 24/7.
 *    Select "setupAutomaticScanner" in the function dropdown and click "Run" (▶️).
 */
function setupAutomaticScanner() {
  // Clear any existing triggers to avoid duplicates
  disableAutomaticScanner();

  // Create automatic 1-minute background scanner trigger
  ScriptApp.newTrigger("syncAllPatientsFromClinic")
    .timeBased()
    .everyMinutes(1)
    .create();

  // Run immediate first scan to populate sheet now
  var result = syncAllPatientsFromClinic();

  try {
    var ss = getSpreadsheet();
    if (ss) {
      ss.toast("⚡ Automatic 1-Minute Scanner is ACTIVE! Live data scanning every minute.", "Clinic Auto-Scanner", 8);
    }
  } catch (e) {}

  return result;
}

/**
 * 3. Stop / Disable Background Automatic Scanner
 */
function disableAutomaticScanner() {
  var triggers = ScriptApp.getProjectTriggers();
  var count = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "syncAllPatientsFromClinic") {
      ScriptApp.deleteTrigger(triggers[i]);
      count++;
    }
  }
  try {
    var ss = getSpreadsheet();
    if (ss) {
      ss.toast("🛑 Automatic Scanner paused (" + count + " triggers cleared).", "Clinic Auto-Scanner", 5);
    }
  } catch (e) {}
}

/**
 * 4. Main scanner function: Fetches all live patients, appointments & feedback and writes to sheet tabs
 */
function syncAllPatientsFromClinic() {
  var ss = getSpreadsheet();
  if (!ss) {
    throw new Error("Could not open spreadsheet. Please ensure this script is inside your Google Sheet or SPREADSHEET_ID is correct.");
  }

  var summary = [];

  // A. Scan & Write Contacts Tab (Patient Profiles)
  try {
    var contactsRes = UrlFetchApp.fetch(API_BASE_URL + "/api/sheets/live-data?tab=contacts", { muteHttpExceptions: true });
    if (contactsRes.getResponseCode() === 200) {
      var contactsCsv = contactsRes.getContentText();
      var contactsData = Utilities.parseCsv(contactsCsv);
      writeCsvToSheet(ss, "Contacts", contactsData);
      summary.push((contactsData.length - 1) + " Patients");
    } else {
      Logger.log("Contacts endpoint returned HTTP " + contactsRes.getResponseCode());
    }
  } catch (e) {
    Logger.log("Error syncing contacts: " + e);
  }

  // B. Scan & Write Bookings Tab (Appointments)
  try {
    var bookingsRes = UrlFetchApp.fetch(API_BASE_URL + "/api/sheets/live-data?tab=bookings", { muteHttpExceptions: true });
    if (bookingsRes.getResponseCode() === 200) {
      var bookingsCsv = bookingsRes.getContentText();
      var bookingsData = Utilities.parseCsv(bookingsCsv);
      writeCsvToSheet(ss, "Bookings", bookingsData);
      summary.push((bookingsData.length - 1) + " Bookings");
    } else {
      Logger.log("Bookings endpoint returned HTTP " + bookingsRes.getResponseCode());
    }
  } catch (e) {
    Logger.log("Error syncing bookings: " + e);
  }

  // C. Scan & Write Feedback Tab (Reviews)
  try {
    var feedbackRes = UrlFetchApp.fetch(API_BASE_URL + "/api/sheets/live-data?tab=feedback", { muteHttpExceptions: true });
    if (feedbackRes.getResponseCode() === 200) {
      var feedbackCsv = feedbackRes.getContentText();
      var feedbackData = Utilities.parseCsv(feedbackCsv);
      writeCsvToSheet(ss, "Feedback", feedbackData);
      summary.push((feedbackData.length - 1) + " Reviews");
    } else {
      Logger.log("Feedback endpoint returned HTTP " + feedbackRes.getResponseCode());
    }
  } catch (e) {
    Logger.log("Error syncing feedback: " + e);
  }

  try {
    ss.toast("✅ Scanned & updated: " + summary.join(", "), "Clinic Live Sync", 4);
  } catch (e) {}

  return { success: true, message: "Scan completed: " + summary.join(", ") };
}

/**
 * 5. Writes 2D array data to sheet tab with clean styling and auto-sized columns
 */
function writeCsvToSheet(ss, sheetName, data) {
  if (!data || data.length === 0) return;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    // If empty default Sheet1 exists, rename it for the first tab
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

  // Freeze header row
  sheet.setFrozenRows(1);

  // Auto-fit column widths
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
  var headers = Object.keys(rows[0]);
  var data = [headers];
  for (var i = 0; i < rows.length; i++) {
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      row.push(rows[i][headers[j]] != null ? rows[i][headers[j]] : "");
    }
    data.push(row);
  }
  writeCsvToSheet(ss, sheetName, data);
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
    if (SPREADSHEET_ID) {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    }
  } catch (e) {
    Logger.log("openById failed: " + e);
  }
  return null;
}

/**
 * 6. Handles Web App GET requests
 */
function doGet(e) {
  try {
    if (e && e.parameter && (e.parameter.sync === "1" || e.parameter.action === "SYNC_ALL")) {
      var result = syncAllPatientsFromClinic();
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({
      status: "ACTIVE",
      service: "SmileCraft Live Scanner",
      spreadsheetId: SPREADSHEET_ID
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 7. Handles Web App POST requests (from Admin Panel 'Sync Now' or new booking hooks)
 */
function doPost(e) {
  try {
    var contents = null;
    if (e && e.postData && e.postData.contents) {
      try {
        contents = JSON.parse(e.postData.contents);
      } catch (pe) {}
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

    var result = syncAllPatientsFromClinic();
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
