/**
 * GOOGLE APPS SCRIPT - DATABASE UCAPAN & RSVP GIDEON & MARIA
 * =====================================================================
 * 
 * PANDUAN CEPAT (1 MENIT):
 * 1. Buka browser dan buka https://sheets.new (akan membuka Google Sheet baru).
 * 2. Beri nama file Google Sheet Anda (misal: "Database Undangan Gideon & Maria").
 * 3. Pada baris 1 (Header), buat kolom berikut:
 *    - Kolom A: Timestamp
 *    - Kolom B: Nama
 *    - Kolom C: Ucapan
 *    - Kolom D: Kehadiran
 * 4. Klik menu atas: Extensions (Ekstensi) > Apps Script.
 * 5. Hapus semua teks default di editor kode tersebut, lalu PASTE SELURUH KODE DI BAWAH INI.
 * 6. Klik tombol "Deploy" (Terapkan) berwarna biru di kanan atas > Pilih "New deployment" (Penerapan baru).
 * 7. Klik icon Gear (⚙️) di sebelah "Select type" > Pilih "Web app" (Aplikasi web).
 * 8. Isi pengaturan:
 *    - Description: Database Ucapan Undangan
 *    - Execute as: Me (email akun Google Anda)
 *    - Who has access: Anyone (Siapa saja)  <-- PENTING SEKALI agar tamu bisa kirim ucapan!
 * 9. Klik "Deploy" (Terapkan).
 * 10. Jika muncul "Authorize Access", klik Review Permissions > pilih akun Google Anda > klik "Advanced" > klik "Go to Database (unsafe)" > Allow.
 * 11. Salin "Web App URL" yang berakhiran "/exec".
 * 12. Buka file "js/script.js" di proyek ini, lalu tempelkan URL tersebut ke:
 *     const GOOGLE_SHEET_ENDPOINT = 'PASTE_URL_WEB_APP_DISINI';
 * =====================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Tunggu hingga 10 detik agar penulisan baris aman dari race-condition tamu bersamaan
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Buat header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Nama", "Ucapan", "Kehadiran"]);
      sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
    }

    var name = "";
    var message = "";
    var status = "Hadir";
    var timestamp = new Date();

    // Parse data JSON dari body fetch
    if (e && e.postData && e.postData.contents) {
      try {
        var data = JSON.parse(e.postData.contents);
        name = data.name || "";
        message = data.message || "";
        status = data.status || "Hadir";
      } catch (errParse) {
        // Fallback jika dikirim format URL-encoded
        if (e.parameter) {
          name = e.parameter.name || "";
          message = e.parameter.message || "";
          status = e.parameter.status || "Hadir";
        }
      }
    } else if (e && e.parameter) {
      name = e.parameter.name || "";
      message = e.parameter.message || "";
      status = e.parameter.status || "Hadir";
    }

    if (name || message) {
      sheet.appendRow([timestamp, name, message, status]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Ucapan berhasil dicatat ke Google Sheets"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var results = [];

    // Mulai dari baris ke-2 (index 1) karena baris 1 adalah header
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (row[1] || row[2]) {
        results.push({
          timestamp: row[0] ? new Date(row[0]).getTime() : Date.now(),
          name: String(row[1] || "Tamu Undangan"),
          message: String(row[2] || ""),
          status: String(row[3] || "Hadir")
        });
      }
    }

    // Urutkan ucapan dari yang terbaru di atas
    results.reverse();

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      data: results
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
