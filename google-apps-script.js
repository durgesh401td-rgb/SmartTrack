/**
 * SmartTrack Backend Webhook (Google Apps Script)
 * Handles:
 * 1. Financial Transactions & Enquiries (Sheet: "Transactions")
 * 2. Real-time Action / Audit Logs (Sheet: "Action_Logs")
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // ROUTE 1: ACTION / AUDIT LOG RECORDING
    if (data.type === "action_log" || data.action) {
      var logSheet = ss.getSheetByName("Action_Logs");
      if (!logSheet) {
        logSheet = ss.insertSheet("Action_Logs");
      }

      // Initialize headers if new
      if (logSheet.getLastRow() === 0) {
        logSheet.appendRow([
          "Timestamp",
          "Action Type",
          "Action Details",
          "Page URL",
          "Client IP / Meta",
          "Payload Summary"
        ]);
        logSheet.getRange("A1:F1").setFontWeight("bold").setBackground("#e0f2fe");
      }

      logSheet.appendRow([
        timestamp,
        data.action || "User Interaction",
        typeof data.details === "object" ? JSON.stringify(data.details) : (data.details || "N/A"),
        data.page || "N/A",
        data.clientMeta || "Web Client",
        JSON.stringify(data)
      ]);

      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", loggedAction: data.action }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ROUTE 2: TRANSACTIONS & FORM SUBMISSIONS
    var txSheet = ss.getSheetByName("Transactions");
    if (!txSheet) {
      txSheet = ss.getActiveSheet();
      if (txSheet.getName() !== "Transactions") {
        txSheet.setName("Transactions");
      }
    }

    // Automatically create header row if empty
    if (txSheet.getLastRow() === 0) {
      txSheet.appendRow([
        "Timestamp",
        "Full Name",
        "Email",
        "Entry Type",
        "Category",
        "Amount (₹)",
        "Notes / Message"
      ]);
      txSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#ecfdf5");
    }

    // Append transaction entry (in INR ₹)
    txSheet.appendRow([
      timestamp,
      data.fullName || "N/A",
      data.email || "N/A",
      data.entryType || "N/A",
      data.category || "N/A",
      data.amount ? "₹" + data.amount : "₹0",
      data.notes || "N/A"
    ]);

    // Also record this submission into Action_Logs
    var autoLogSheet = ss.getSheetByName("Action_Logs");
    if (autoLogSheet) {
      autoLogSheet.appendRow([
        timestamp,
        "Transaction Submitted",
        "User " + (data.fullName || "Anonymous") + " logged " + (data.entryType || "Entry") + " of ₹" + (data.amount || 0),
        data.page || "Contact & Log",
        "Web Client",
        JSON.stringify({ category: data.category, email: data.email })
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", result: "transaction_recorded" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "alive", service: "SmartTrack Backend Logger", currency: "INR (₹)" }))
    .setMimeType(ContentService.MimeType.JSON);
}