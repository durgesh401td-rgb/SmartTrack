function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Automatically create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Email",
        "Entry Type",
        "Category",
        "Amount ($)",
        "Notes / Message"
      ]);
      sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#ecfdf5");
    }

    var data = JSON.parse(e.postData.contents);

    // Append user form data
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.fullName || "N/A",
      data.email || "N/A",
      data.entryType || "N/A",
      data.category || "N/A",
      data.amount || 0,
      data.notes || "N/A"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}