/**
 * ============================================================
 * PORTAL DIREKTORI PENGUSAHA TERNAKAN — DVS MALAYSIA
 * Google Apps Script Backend v2.0
 * ============================================================
 * Spreadsheet: 1YKzqywmFj9cu0uYQhVGIndmnL4roYV3gYIe4OXoCxL0
 * GAS Project:  1QrOl4O085g_6tavM10CLCnWJ7a-smgieDN2i7zKTpJ4-2TYVzeAD754p
 * GitHub Pages: https://itumelaka.github.io/listpengusaha/
 * ============================================================
 */

// ─── KONFIGURASI UTAMA ────────────────────────────────────────
const CONFIG = {
  SPREADSHEET_ID: '1YKzqywmFj9cu0uYQhVGIndmnL4roYV3gYIe4OXoCxL0',
  SHEET_RESPONSES: 'Form Responses 1',   // sheet data utama (dari Google Form lama)
  SHEET_CLEANED:   'DataBersih',         // sheet data yang telah disemak & diluluskan
  SHEET_AUDIT:     'AuditLog',           // log semua tindakan admin
  ADMIN_EMAIL:     'itumelaka@gmail.com',
  OTP_EXPIRY_MIN:  10,                   // OTP tamat dalam 10 minit
  ALLOWED_ORIGINS: [
    'https://itumelaka.github.io',
    'https://script.google.com'
  ]
};

// ─── HEADER CORS ─────────────────────────────────────────────
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}

// ─── ENTRY POINT: GET ─────────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action || 'getDirectory';

    switch (action) {
      case 'getDirectory':    return handleGetDirectory(e);
      case 'getStats':        return handleGetStats(e);
      case 'ping':            return jsonResponse({ status: 'ok', ts: new Date().toISOString() });
      default:
        return jsonResponse({ error: 'Tindakan tidak dikenali: ' + action }, 400);
    }
  } catch (err) {
    logError('doGet', err);
    return jsonResponse({ error: 'Ralat pelayan: ' + err.message }, 500);
  }
}

// ─── ENTRY POINT: POST ────────────────────────────────────────
function doPost(e) {
  try {
    // CORS preflight
    if (!e.postData) return jsonResponse({ status: 'ok' });

    const payload = JSON.parse(e.postData.contents);
    const action  = payload.action || '';

    switch (action) {
      case 'requestOtp':      return handleRequestOtp(payload);
      case 'verifyOtp':       return handleVerifyOtp(payload);
      case 'submitForm':      return handleSubmitForm(payload);
      case 'approveRecord':   return handleApprove(payload);
      case 'rejectRecord':    return handleReject(payload);
      case 'getAdminData':    return handleGetAdminData(payload);
      case 'bulkApprove':     return handleBulkApprove(payload);
      default:
        return jsonResponse({ error: 'Tindakan POST tidak dikenali: ' + action }, 400);
    }
  } catch (err) {
    logError('doPost', err);
    return jsonResponse({ error: 'Ralat pelayan: ' + err.message }, 500);
  }
}

// ─── DIREKTORI AWAM ──────────────────────────────────────────
function handleGetDirectory(e) {
  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_RESPONSES);

  if (!sheet) return jsonResponse({ error: 'Sheet tidak dijumpai', data: [] });

  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];
  const records = [];

  // Indeks lajur (0-based)
  const COL = getColumnIndex(headers);

  for (let i = 1; i < rows.length; i++) {
    const row    = rows[i];
    const nama   = String(row[COL.nama] || '').trim();
    const setuju = String(row[COL.setuju] || '').toUpperCase();
    const status = String(row[COL.status] || '').toUpperCase();

    // Hanya paparkan yang ada nama, bersetuju, dan status APPROVED (atau kosong = lama)
    if (!nama || nama === '' ) continue;
    if (setuju && setuju !== 'SETUJU' && setuju !== 'YA' && setuju !== 'TRUE') continue;
    if (status && status !== 'APPROVED' && status !== 'LULUS') continue;

    const jenis = normalizeJenis(String(row[COL.jenis] || ''));
    const wa    = String(row[COL.wa] || '').trim();
    const fb    = String(row[COL.fb] || '').trim();

    records.push({
      id:        i,
      nama:      nama,
      jenis:     jenis,
      negeri:    toTitleCase(String(row[COL.negeri] || '')),
      lokasi:    String(row[COL.lokasi] || '').trim(),
      wa:        sanitizeWa(wa),
      fb:        sanitizeFb(fb),
      timestamp: String(row[COL.ts] || ''),
    });
  }

  return jsonResponse({
    status:  'ok',
    count:   records.length,
    data:    records,
    updated: new Date().toISOString()
  });
}

// ─── STATISTIK ───────────────────────────────────────────────
function handleGetStats(e) {
  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_RESPONSES);

  if (!sheet) return jsonResponse({ error: 'Sheet tidak dijumpai' });

  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];
  const COL     = getColumnIndex(headers);

  let total = 0, pending = 0, approved = 0, rejected = 0;
  const byNegeri = {}, byJenis = {};

  for (let i = 1; i < rows.length; i++) {
    const row    = rows[i];
    const nama   = String(row[COL.nama] || '').trim();
    if (!nama) continue;

    total++;
    const status = String(row[COL.status] || '').toUpperCase();
    if (status === 'APPROVED' || status === 'LULUS') approved++;
    else if (status === 'REJECTED' || status === 'TOLAK') rejected++;
    else pending++;

    const negeri = toTitleCase(String(row[COL.negeri] || 'Tidak Dinyatakan'));
    const jenis  = normalizeJenis(String(row[COL.jenis] || ''));
    byNegeri[negeri] = (byNegeri[negeri] || 0) + 1;
    byJenis[jenis]   = (byJenis[jenis] || 0) + 1;
  }

  return jsonResponse({
    status: 'ok',
    stats: { total, pending, approved, rejected, byNegeri, byJenis }
  });
}

// ─── HANTAR BORANG PENDAFTARAN BARU ──────────────────────────
function handleSubmitForm(payload) {
  const { nama, wa, negeri, lokasi, jenis, email, fb, setuju } = payload;

  // Validasi wajib
  const errors = [];
  if (!nama)   errors.push('Nama wajib diisi');
  if (!wa)     errors.push('No. WhatsApp wajib diisi');
  if (!negeri) errors.push('Negeri wajib dipilih');
  if (!lokasi) errors.push('Lokasi ladang wajib diisi');
  if (!jenis)  errors.push('Jenis perusahaan wajib dipilih');
  if (!email)  errors.push('E-mel wajib diisi');
  if (!setuju) errors.push('Persetujuan data wajib diberikan');

  if (errors.length) return jsonResponse({ error: errors.join('; ') }, 400);

  // Semak duplikat (e-mel atau WA yang sama dalam 24 jam)
  if (isDuplicate(email, wa)) {
    return jsonResponse({ error: 'Pendaftaran dengan e-mel atau nombor ini telahpun diterima. Sila hubungi pentadbir.' }, 409);
  }

  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_RESPONSES);

  if (!sheet) return jsonResponse({ error: 'Ralat sistem: sheet tidak dijumpai' }, 500);

  const ts   = new Date();
  const row  = [
    Utilities.formatDate(ts, 'Asia/Kuala_Lumpur', 'dd/MM/yyyy HH:mm:ss'),
    nama.trim().toUpperCase(),
    wa.trim(),
    negeri.trim().toUpperCase(),
    lokasi.trim(),
    fb ? fb.trim() : '',
    email.trim().toLowerCase(),
    jenis.trim(),
    'SETUJU',
    'PENDING',    // Status awal
    '',           // ApprovedBy
    '',           // ApprovedAt
    ts.toISOString(), // UpdatedAt
    ''            // ReviewNote
  ];

  sheet.appendRow(row);

  // Hantar e-mel pengesahan kepada pemohon
  try {
    sendConfirmationEmail(email, nama, jenis, negeri);
  } catch (emailErr) {
    logError('sendConfirmationEmail', emailErr);
  }

  // Hantar notifikasi kepada admin
  try {
    sendAdminNotification(nama, email, jenis, negeri);
  } catch (adminErr) {
    logError('sendAdminNotification', adminErr);
  }

  // Log audit
  appendAuditLog('SUBMIT', sheet.getLastRow(), '', 'PENDING', email, 'Pendaftaran baru');

  return jsonResponse({
    status:  'ok',
    message: 'Pendaftaran berjaya dihantar. E-mel pengesahan telah dihantar ke ' + email
  });
}

// ─── OTP: MINTA ──────────────────────────────────────────────
function handleRequestOtp(payload) {
  const email = (payload.email || '').trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return jsonResponse({ error: 'E-mel tidak sah' }, 400);
  }

  const otp    = generateOtp();
  const expiry = new Date(Date.now() + CONFIG.OTP_EXPIRY_MIN * 60 * 1000);

  // Simpan OTP dalam Script Properties (bukan cache awam)
  const props = PropertiesService.getScriptProperties();
  props.setProperty('OTP_' + email, JSON.stringify({ otp, expiry: expiry.toISOString(), used: false }));

  // Hantar OTP via e-mel
  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Kod OTP — Portal Direktori Pengusaha Ternakan DVS',
      htmlBody: buildOtpEmailHtml(email, otp),
      noReply:  true
    });
  } catch (err) {
    logError('handleRequestOtp', err);
    return jsonResponse({ error: 'Gagal menghantar e-mel. Sila cuba lagi.' }, 500);
  }

  return jsonResponse({
    status:  'ok',
    message: 'Kod OTP telah dihantar ke ' + email + '. Sah selama ' + CONFIG.OTP_EXPIRY_MIN + ' minit.'
  });
}

// ─── OTP: SAHKAN ─────────────────────────────────────────────
function handleVerifyOtp(payload) {
  const email = (payload.email || '').trim().toLowerCase();
  const otp   = (payload.otp || '').trim();

  if (!email || !otp) return jsonResponse({ error: 'E-mel dan OTP diperlukan' }, 400);

  const props   = PropertiesService.getScriptProperties();
  const stored  = props.getProperty('OTP_' + email);

  if (!stored) return jsonResponse({ error: 'OTP tidak dijumpai. Sila minta kod baru.' }, 401);

  let data;
  try { data = JSON.parse(stored); } catch (e) {
    return jsonResponse({ error: 'Ralat OTP. Sila minta kod baru.' }, 500);
  }

  if (data.used) return jsonResponse({ error: 'OTP telah digunakan. Sila minta kod baru.' }, 401);
  if (new Date() > new Date(data.expiry)) {
    props.deleteProperty('OTP_' + email);
    return jsonResponse({ error: 'OTP telah tamat tempoh. Sila minta kod baru.' }, 401);
  }
  if (data.otp !== otp) return jsonResponse({ error: 'Kod OTP tidak betul.' }, 401);

  // Tandakan sebagai digunakan
  data.used = true;
  props.setProperty('OTP_' + email, JSON.stringify(data));

  // Tentukan hak akses
  const isAdmin = email === CONFIG.ADMIN_EMAIL;

  // Bina token sesi ringkas (tidak cryptographically secure — untuk demo)
  const sessionToken = Utilities.base64Encode(
    email + '|' + Date.now() + '|' + Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, email + data.otp)
      .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('')
  );

  return jsonResponse({
    status:      'ok',
    email:       email,
    isAdmin:     isAdmin,
    token:       sessionToken,
    message:     'Log masuk berjaya'
  });
}

// ─── ADMIN: DAPATKAN DATA ────────────────────────────────────
function handleGetAdminData(payload) {
  if (!verifyAdminSession(payload)) {
    return jsonResponse({ error: 'Akses ditolak. Sesi tidak sah.' }, 403);
  }

  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_RESPONSES);

  if (!sheet) return jsonResponse({ error: 'Sheet tidak dijumpai', data: [] });

  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];
  const COL     = getColumnIndex(headers);
  const records = [];

  for (let i = 1; i < rows.length; i++) {
    const row  = rows[i];
    const nama = String(row[COL.nama] || '').trim();
    if (!nama) continue;

    records.push({
      rowIndex:   i + 1,   // 1-based untuk sheet
      timestamp:  String(row[COL.ts] || ''),
      nama:       nama,
      wa:         String(row[COL.wa] || ''),
      negeri:     String(row[COL.negeri] || ''),
      lokasi:     String(row[COL.lokasi] || ''),
      fb:         String(row[COL.fb] || ''),
      email:      String(row[COL.email] || ''),
      jenis:      String(row[COL.jenis] || ''),
      setuju:     String(row[COL.setuju] || ''),
      status:     String(row[COL.status] || 'PENDING'),
      approvedBy: String(row[COL.approvedBy] || ''),
      approvedAt: String(row[COL.approvedAt] || ''),
      updatedAt:  String(row[COL.updatedAt] || ''),
      note:       String(row[COL.note] || '')
    });
  }

  return jsonResponse({ status: 'ok', count: records.length, data: records });
}

// ─── ADMIN: LULUS REKOD ──────────────────────────────────────
function handleApprove(payload) {
  if (!verifyAdminSession(payload)) {
    return jsonResponse({ error: 'Akses ditolak.' }, 403);
  }

  const rowIndex = parseInt(payload.rowIndex);
  if (!rowIndex || rowIndex < 2) return jsonResponse({ error: 'rowIndex tidak sah' }, 400);

  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_RESPONSES);
  const COL   = getColumnIndex(sheet.getDataRange().getValues()[0]);
  const ts    = new Date().toISOString();

  sheet.getRange(rowIndex, COL.status + 1).setValue('APPROVED');
  sheet.getRange(rowIndex, COL.approvedBy + 1).setValue(payload.adminEmail || CONFIG.ADMIN_EMAIL);
  sheet.getRange(rowIndex, COL.approvedAt + 1).setValue(ts);
  sheet.getRange(rowIndex, COL.updatedAt + 1).setValue(ts);
  if (payload.note) sheet.getRange(rowIndex, COL.note + 1).setValue(payload.note);

  appendAuditLog('APPROVE', rowIndex, 'PENDING', 'APPROVED', payload.adminEmail, payload.note || '');

  return jsonResponse({ status: 'ok', message: 'Rekod telah diluluskan.' });
}

// ─── ADMIN: TOLAK REKOD ──────────────────────────────────────
function handleReject(payload) {
  if (!verifyAdminSession(payload)) {
    return jsonResponse({ error: 'Akses ditolak.' }, 403);
  }

  const rowIndex = parseInt(payload.rowIndex);
  if (!rowIndex || rowIndex < 2) return jsonResponse({ error: 'rowIndex tidak sah' }, 400);

  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_RESPONSES);
  const COL   = getColumnIndex(sheet.getDataRange().getValues()[0]);
  const ts    = new Date().toISOString();

  sheet.getRange(rowIndex, COL.status + 1).setValue('REJECTED');
  sheet.getRange(rowIndex, COL.approvedBy + 1).setValue(payload.adminEmail || CONFIG.ADMIN_EMAIL);
  sheet.getRange(rowIndex, COL.approvedAt + 1).setValue(ts);
  sheet.getRange(rowIndex, COL.updatedAt + 1).setValue(ts);
  if (payload.note) sheet.getRange(rowIndex, COL.note + 1).setValue(payload.note);

  appendAuditLog('REJECT', rowIndex, 'PENDING', 'REJECTED', payload.adminEmail, payload.note || '');

  return jsonResponse({ status: 'ok', message: 'Rekod telah ditolak.' });
}

// ─── ADMIN: LULUS PUKAL ──────────────────────────────────────
function handleBulkApprove(payload) {
  if (!verifyAdminSession(payload)) {
    return jsonResponse({ error: 'Akses ditolak.' }, 403);
  }

  const rows = payload.rows || [];
  if (!rows.length) return jsonResponse({ error: 'Tiada baris dipilih' }, 400);

  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_RESPONSES);
  const COL   = getColumnIndex(sheet.getDataRange().getValues()[0]);
  const ts    = new Date().toISOString();
  let count   = 0;

  rows.forEach(rowIndex => {
    if (rowIndex < 2) return;
    sheet.getRange(rowIndex, COL.status + 1).setValue('APPROVED');
    sheet.getRange(rowIndex, COL.approvedBy + 1).setValue(payload.adminEmail || CONFIG.ADMIN_EMAIL);
    sheet.getRange(rowIndex, COL.approvedAt + 1).setValue(ts);
    sheet.getRange(rowIndex, COL.updatedAt + 1).setValue(ts);
    appendAuditLog('BULK_APPROVE', rowIndex, 'PENDING', 'APPROVED', payload.adminEmail, 'Kelulusan pukal');
    count++;
  });

  SpreadsheetApp.flush();
  return jsonResponse({ status: 'ok', message: count + ' rekod telah diluluskan.' });
}

// ═══════════════════════════════════════════════════════════════
// FUNGSI PEMBANTU
// ═══════════════════════════════════════════════════════════════

/** Dapatkan indeks lajur berdasarkan header */
function getColumnIndex(headers) {
  const map = {};
  headers.forEach((h, i) => { map[i] = i; });

  // Peta nama header kepada nama normalised
  const COL = {
    ts:         -1, nama:       -1, wa:         -1,
    negeri:     -1, lokasi:     -1, fb:         -1,
    email:      -1, jenis:      -1, setuju:     -1,
    status:     -1, approvedBy: -1, approvedAt: -1,
    updatedAt:  -1, note:       -1
  };

  headers.forEach((h, i) => {
    const l = h.toString().toLowerCase().trim();
    if (l.includes('timestamp'))                   COL.ts         = i;
    else if (l.includes('nama') || l.includes('syarikat') || l.includes('ladang') && i < 3) COL.nama = i;
    else if (l.includes('telefon') || l.includes('whatsapp') || l.includes('no.') || l.includes('no telefon')) COL.wa = i;
    else if (l.includes('negeri'))                 COL.negeri     = i;
    else if (l.includes('lokasi'))                 COL.lokasi     = i;
    else if (l.includes('facebook') || l.includes('fb url')) COL.fb = i;
    else if (l.includes('email') || l.includes('e-mel'))     COL.email = i;
    else if (l.includes('jenis'))                  COL.jenis      = i;
    else if (l.includes('setuju') || l.includes('persetujuan')) COL.setuju = i;
    else if (l === 'status')                       COL.status     = i;
    else if (l.includes('approvedby'))             COL.approvedBy = i;
    else if (l.includes('approvedat'))             COL.approvedAt = i;
    else if (l.includes('updatedat'))              COL.updatedAt  = i;
    else if (l.includes('reviewnote') || l.includes('note')) COL.note = i;
  });

  // Fallback untuk data lama (format asal spreadsheet)
  if (COL.ts         === -1) COL.ts         = 0;
  if (COL.nama       === -1) COL.nama       = 1;
  if (COL.wa         === -1) COL.wa         = 2;
  if (COL.negeri     === -1) COL.negeri     = 3;
  if (COL.lokasi     === -1) COL.lokasi     = 4;
  if (COL.fb         === -1) COL.fb         = 5;
  if (COL.email      === -1) COL.email      = 6;
  if (COL.jenis      === -1) COL.jenis      = 7;
  if (COL.setuju     === -1) COL.setuju     = 8;
  if (COL.status     === -1) COL.status     = 9;
  if (COL.approvedBy === -1) COL.approvedBy = 10;
  if (COL.approvedAt === -1) COL.approvedAt = 11;
  if (COL.updatedAt  === -1) COL.updatedAt  = 12;
  if (COL.note       === -1) COL.note       = 13;

  return COL;
}

/** Normalise jenis ternakan */
function normalizeJenis(raw) {
  if (!raw || raw === 'TIDAK DINYATAKAN' || raw === '') return 'Lain-lain';
  const l = raw.toLowerCase();
  if (l.includes('ayam') && l.includes('itik')) return 'Ternakan Ayam & Itik';
  if (l.includes('ayam'))  return 'Ternakan Ayam';
  if (l.includes('itik') || l.includes('angsa') || l.includes('burung')) return 'Ternakan Itik & Unggas';
  if (l.includes('lembu') && l.includes('kambing')) return 'Ternakan Lembu & Kambing';
  if (l.includes('lembu')) return 'Ternakan Lembu';
  if (l.includes('kambing') || l.includes('ruminan') || l.includes('biri')) return 'Ternakan Kambing';
  if (l.includes('ikan') || l.includes('udang') || l.includes('akuakultur') || l.includes('ternakan air')) return 'Akuakultur';
  if (l.includes('lebah') || l.includes('madu')) return 'Lebah Madu';
  if (l.includes('rusa')) return 'Ternakan Rusa';
  if (l.includes('pertanian') || l.includes('sayur') || l.includes('tanaman')) return 'Pertanian';
  return raw.length > 40 ? raw.substring(0, 40) + '...' : raw;
}

/** Sanitize nombor WhatsApp */
function sanitizeWa(wa) {
  if (!wa) return '';
  // Pastikan format wasap.my atau +60
  if (wa.startsWith('www.wasap.my')) return wa;
  const digits = wa.replace(/\D/g, '');
  if (digits.startsWith('60') && digits.length >= 10) return '+' + digits;
  if (digits.startsWith('0') && digits.length >= 9)  return '+6' + digits;
  return wa;
}

/** Sanitize URL Facebook */
function sanitizeFb(fb) {
  if (!fb || fb === 'TIADA' || fb === 'TIDAK DINYATAKAN' || fb.toLowerCase() === 'tiada') return '';
  if (fb.startsWith('http')) return fb;
  return fb;
}

/** Format Title Case */
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

/** Semak e-mel sah */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Jana OTP 6 digit */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Semak sesi admin (mudah — token base64) */
function verifyAdminSession(payload) {
  const email = (payload.adminEmail || '').toLowerCase();
  return email === CONFIG.ADMIN_EMAIL && payload.token;
}

/** Semak duplikat pendaftaran */
function isDuplicate(email, wa) {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEET_RESPONSES);
    const rows  = sheet.getDataRange().getValues();
    const COL   = getColumnIndex(rows[0]);
    const since = Date.now() - 24 * 60 * 60 * 1000; // 24 jam lepas

    for (let i = 1; i < rows.length; i++) {
      const rowTs = new Date(rows[i][COL.ts]);
      if (isNaN(rowTs.getTime()) || rowTs.getTime() < since) continue;
      if (String(rows[i][COL.email]).toLowerCase() === email.toLowerCase()) return true;
      if (rows[i][COL.wa] && String(rows[i][COL.wa]).replace(/\D/g, '') === wa.replace(/\D/g, '')) return true;
    }
  } catch (e) { /* abaikan */ }
  return false;
}

/** Log audit */
function appendAuditLog(action, rowIndex, oldStatus, newStatus, reviewer, note) {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet   = ss.getSheetByName(CONFIG.SHEET_AUDIT);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_AUDIT);
      sheet.appendRow(['Timestamp', 'RowId', 'Action', 'OldStatus', 'NewStatus', 'Reviewer', 'Note', 'Source']);
    }
    sheet.appendRow([
      new Date().toISOString(), rowIndex, action,
      oldStatus, newStatus, reviewer, note, 'GAS_API_v2'
    ]);
  } catch (e) { /* abaikan ralat audit */ }
}

/** Log ralat */
function logError(context, err) {
  console.error('[' + context + '] ' + err.message + '\n' + (err.stack || ''));
}

/** Bina respons JSON */
function jsonResponse(data, code) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/** E-mel pengesahan kepada pemohon */
function sendConfirmationEmail(email, nama, jenis, negeri) {
  MailApp.sendEmail({
    to:       email,
    subject:  '✅ Pendaftaran Diterima — Portal Direktori Pengusaha Ternakan DVS',
    htmlBody: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="text-align:center;background:#1a6b3c;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="color:#fff;margin:0">Portal Direktori Pengusaha Ternakan</h2>
          <p style="color:#a8d5b9;margin:5px 0 0">Jabatan Perkhidmatan Veterinar Malaysia</p>
        </div>
        <div style="padding:24px">
          <p>Salam Sejahtera <strong>${nama}</strong>,</p>
          <p>Pendaftaran anda telah <strong>berjaya diterima</strong> dan sedang dalam proses semakan.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Nama / Syarikat</td><td style="padding:8px;border-bottom:1px solid #eee"><strong>${nama}</strong></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Jenis Perusahaan</td><td style="padding:8px;border-bottom:1px solid #eee">${jenis}</td></tr>
            <tr><td style="padding:8px;color:#666">Negeri</td><td style="padding:8px">${negeri}</td></tr>
          </table>
          <p>Maklumat anda akan dipaparkan dalam direktori dalam masa <strong>1-2 hari bekerja</strong> selepas disemak.</p>
          <p>Untuk pertanyaan, sila hubungi: <a href="mailto:${CONFIG.ADMIN_EMAIL}">${CONFIG.ADMIN_EMAIL}</a></p>
        </div>
        <div style="text-align:center;padding:12px;background:#f5f5f5;border-radius:0 0 8px 8px;font-size:12px;color:#999">
          © 2026 Portal Direktori Pengusaha Ternakan DVS Malaysia
        </div>
      </div>`,
    noReply: true
  });
}

/** Notifikasi admin pendaftaran baru */
function sendAdminNotification(nama, email, jenis, negeri) {
  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_RESPONSES);
  const rowNo = sheet.getLastRow();

  MailApp.sendEmail({
    to:       CONFIG.ADMIN_EMAIL,
    subject:  '🆕 Pendaftaran Baru: ' + nama,
    htmlBody: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h3>Pendaftaran Baru Diterima</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px;color:#666">Nama</td><td style="padding:6px"><strong>${nama}</strong></td></tr>
          <tr><td style="padding:6px;color:#666">E-mel</td><td style="padding:6px">${email}</td></tr>
          <tr><td style="padding:6px;color:#666">Jenis</td><td style="padding:6px">${jenis}</td></tr>
          <tr><td style="padding:6px;color:#666">Negeri</td><td style="padding:6px">${negeri}</td></tr>
          <tr><td style="padding:6px;color:#666">Baris</td><td style="padding:6px">${rowNo}</td></tr>
        </table>
        <p><a href="https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit" style="background:#1a6b3c;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none">Semak dalam Spreadsheet</a></p>
      </div>`
  });
}

/** HTML e-mel OTP */
function buildOtpEmailHtml(email, otp) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
      <div style="text-align:center;background:#1a6b3c;padding:20px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0">Kod Log Masuk OTP</h2>
        <p style="color:#a8d5b9;margin:5px 0 0">Portal Direktori Pengusaha Ternakan DVS</p>
      </div>
      <div style="padding:24px;text-align:center">
        <p>Kod OTP anda untuk <strong>${email}</strong>:</p>
        <div style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#1a6b3c;padding:16px;background:#f0f9f4;border-radius:8px;margin:16px 0">${otp}</div>
        <p style="color:#666;font-size:13px">Kod ini sah selama <strong>${CONFIG.OTP_EXPIRY_MIN} minit</strong>.<br>Jangan kongsikan kod ini kepada sesiapa.</p>
      </div>
      <div style="text-align:center;padding:12px;background:#f5f5f5;border-radius:0 0 8px 8px;font-size:12px;color:#999">
        © 2026 Portal Direktori Pengusaha Ternakan DVS Malaysia
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// UTILITI PENTADBIR — Jalankan sekali dari Editor GAS
// ═══════════════════════════════════════════════════════════════

/** Jalankan ini sekali untuk set up sheet AuditLog */
function setupSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  // Sheet DataBersih
  if (!ss.getSheetByName(CONFIG.SHEET_CLEANED)) {
    const s = ss.insertSheet(CONFIG.SHEET_CLEANED);
    s.appendRow(['Timestamp','Nama','WA','Negeri','Lokasi','Facebook','Email','Jenis','Status','ApprovedBy','ApprovedAt']);
    Logger.log('Sheet DataBersih dicipta.');
  }

  // Sheet AuditLog
  if (!ss.getSheetByName(CONFIG.SHEET_AUDIT)) {
    const s = ss.insertSheet(CONFIG.SHEET_AUDIT);
    s.appendRow(['Timestamp','RowId','Action','OldStatus','NewStatus','Reviewer','Note','Source']);
    Logger.log('Sheet AuditLog dicipta.');
  }

  Logger.log('Setup selesai.');
}

/** Lulus semua rekod lama yang tiada status (migration) */
function migrateApproveOldRecords() {
  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_RESPONSES);
  const rows  = sheet.getDataRange().getValues();
  const COL   = getColumnIndex(rows[0]);
  let count   = 0;
  const ts    = new Date().toISOString();

  for (let i = 1; i < rows.length; i++) {
    const nama   = String(rows[i][COL.nama] || '').trim();
    const status = String(rows[i][COL.status] || '').trim();

    if (!nama) continue;
    if (status === 'APPROVED' || status === 'REJECTED') continue;

    // Data lama (sebelum sistem baru) — lulus secara automatik
    sheet.getRange(i + 1, COL.status + 1).setValue('APPROVED');
    sheet.getRange(i + 1, COL.approvedBy + 1).setValue('SYSTEM_MIGRATION');
    sheet.getRange(i + 1, COL.approvedAt + 1).setValue(ts);
    sheet.getRange(i + 1, COL.updatedAt + 1).setValue(ts);
    count++;
  }

  SpreadsheetApp.flush();
  Logger.log('Migration selesai: ' + count + ' rekod diluluskan.');
  return count;
}

/** Test endpoint */
function testEndpoint() {
  const result = handleGetDirectory({ parameter: {} });
  Logger.log(result.getContent());
}
