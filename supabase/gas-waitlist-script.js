/**
 * Festy Waitlist — Google Apps Script
 *
 * 設定步驟：
 * 1. 建一個 Google Sheet，第一列標題：Timestamp | Name | City | Email
 * 2. Extensions → Apps Script → 貼上這個 script
 * 3. Deploy → New deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. 複製 Deployment URL，加到 Vercel 環境變數：GAS_WAITLIST_URL=<URL>
 */

const SHEET_NAME = "Waitlist"; // 改成你的 sheet tab 名稱

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.city || "",
      data.email || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run manually to verify sheet access
function testWrite() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.appendRow([new Date().toISOString(), "Test Name", "Nürnberg", "test@example.com"]);
  Logger.log("OK");
}
