/**
 * ══════════════════════════════════════════════════════════════
 *  DOMINATE LAW — Google Sheets Form Handler
 *  Paste this entire script into Google Apps Script, then
 *  deploy as a Web App (see sheets-guide.html for instructions).
 * ══════════════════════════════════════════════════════════════
 *
 *  Tabs created automatically on first submission:
 *    • Legal Tools Gate
 *    • Free Downloads Gate
 *    • Community Join
 *    • Guest Speaker
 *    • Contact Us
 *
 *  OPTIONAL EMAIL ALERTS:
 *    Set NOTIFY_EMAIL below to receive an instant email for
 *    every new form submission. Leave empty '' to disable.
 */

/* ── Configuration ─────────────────────────────────────────── */
var NOTIFY_EMAIL = 'rushdhaakbar82@gmail.com,lester@ekwa.com,ashani@ekwa.com,chamika@ekwa.com';  // comma-separated, no spaces

var SHEET_HEADERS = {
  'Legal Tools Gate':    ['Timestamp', 'First Name', 'Last Name', 'Email', 'Role'],
  'Free Downloads Gate': ['Timestamp', 'First Name', 'Last Name', 'Email', 'Firm Name', 'Role'],
  'Community Join':      ['Timestamp', 'Source', 'First Name', 'Last Name', 'Email', 'Role', 'Practice Area'],
  'Guest Speaker':       ['Timestamp', 'First Name', 'Last Name', 'Title', 'Organization', 'Email', 'Phone', 'Type', 'Topic', 'Bio', 'Links'],
  'Contact Us':          ['Timestamp', 'First Name', 'Last Name', 'Email', 'Phone', 'Subject', 'Message']
};

/* ── Main POST handler ─────────────────────────────────────── */
function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var data    = JSON.parse(e.postData.contents);
    var tabName = data.tab;

    if (!tabName || !SHEET_HEADERS[tabName]) {
      output.setContent(JSON.stringify({ status: 'error', message: 'Unknown tab: ' + tabName }));
      return output;
    }

    var ss  = SpreadsheetApp.getActiveSpreadsheet();
    var tab = ss.getSheetByName(tabName);

    /* Create tab with styled headers if it doesn't exist yet */
    if (!tab) {
      tab = ss.insertSheet(tabName);
      var hdr = SHEET_HEADERS[tabName];
      var headerRange = tab.getRange(1, 1, 1, hdr.length);
      headerRange.setValues([hdr]);
      headerRange.setBackground('#3A0D00')
                 .setFontColor('#E8C44A')
                 .setFontWeight('bold')
                 .setFontSize(11);
      tab.setFrozenRows(1);
    }

    /* Build row in header column order */
    var headers = SHEET_HEADERS[tabName];
    var row = headers.map(function(h) {
      if (h === 'Timestamp') return new Date();
      return data[h] || '';
    });

    tab.appendRow(row);

    /* Auto-resize columns */
    try { tab.autoResizeColumns(1, headers.length); } catch(ex) {}

    /* Optional email alert */
    if (NOTIFY_EMAIL) {
      try {
        var subject = '📬 New ' + tabName + ' submission — Dominate Law';
        var body    = 'A new form was submitted on the Dominate Law website.\n\n';
        body += 'Form: ' + tabName + '\n';
        body += 'Time: ' + new Date().toLocaleString() + '\n\n';
        headers.forEach(function(h) {
          if (h !== 'Timestamp') body += h + ': ' + (data[h] || '—') + '\n';
        });
        body += '\nView all submissions:\n' + ss.getUrl();
        MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
      } catch(mailErr) { /* email failed — don't block the response */ }
    }

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
