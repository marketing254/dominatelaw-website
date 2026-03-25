/**
 * ══════════════════════════════════════════════════════════════
 *  DOMINATE LAW — Google Sheets Form Handler
 *  Paste this entire script into Google Apps Script, then
 *  deploy as a Web App (see sheets-guide.html for instructions).
 * ══════════════════════════════════════════════════════════════
 *
 *  Tabs created automatically:
 *    • Legal Tools Gate
 *    • Free Downloads Gate
 *    • Community Join
 *    • Guest Speaker
 *    • Contact Us
 */

var SHEET_HEADERS = {
  'Legal Tools Gate':     ['Timestamp','First Name','Last Name','Email','Role'],
  'Free Downloads Gate':  ['Timestamp','First Name','Last Name','Email','Firm Name','Role'],
  'Community Join':       ['Timestamp','Source','First Name','Last Name','Email','Role','Practice Area'],
  'Guest Speaker':        ['Timestamp','First Name','Last Name','Title','Organization','Email','Phone','Type','Topic','Bio','Links'],
  'Contact Us':           ['Timestamp','First Name','Last Name','Email','Phone','Subject','Message']
};

/* ── Main POST handler ─────────────────────────────────────── */
function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var data = JSON.parse(e.postData.contents);
    var tabName = data.tab;

    if (!tabName || !SHEET_HEADERS[tabName]) {
      output.setContent(JSON.stringify({ status: 'error', message: 'Unknown tab: ' + tabName }));
      return output;
    }

    var ss  = SpreadsheetApp.getActiveSpreadsheet();
    var tab = ss.getSheetByName(tabName);

    // Create tab with headers if it doesn't exist yet
    if (!tab) {
      tab = ss.insertSheet(tabName);
      var headers = SHEET_HEADERS[tabName];
      tab.getRange(1, 1, 1, headers.length).setValues([headers]);
      tab.getRange(1, 1, 1, headers.length)
         .setBackground('#3A0D00')
         .setFontColor('#E8C44A')
         .setFontWeight('bold');
      tab.setFrozenRows(1);
    }

    // Build row in the same order as SHEET_HEADERS
    var headers = SHEET_HEADERS[tabName];
    var row = headers.map(function(h) {
      if (h === 'Timestamp') return new Date();
      var key = h.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      return data[key] || data[h] || '';
    });

    tab.appendRow(row);

    // Auto-resize columns for readability
    try { tab.autoResizeColumns(1, headers.length); } catch(ex) {}

    output.setContent(JSON.stringify({ status: 'ok' }));
  } catch (err) {
    output.setContent(JSON.stringify({ status: 'error', message: err.toString() }));
  }

  return output;
}

/* ── Health check (GET request) ────────────────────────────── */
function doGet(e) {
  return ContentService.createTextOutput('Dominate Law Form Handler — Active ✓');
}
