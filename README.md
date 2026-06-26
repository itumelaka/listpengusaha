# 🐄 Portal Direktori Pengusaha Ternakan DVS Malaysia

> **Inisiatif Institut Teknologi Unggas 2026**  
> Jabatan Perkhidmatan Veterinar Malaysia | Kementerian Pertanian & Keterjaminan Makanan

[![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-green?logo=github)](https://itumelaka.github.io/listpengusaha/)
[![GAS Backend](https://img.shields.io/badge/Backend-Google%20Apps%20Script-blue?logo=google)](https://script.google.com)
[![Data](https://img.shields.io/badge/Data-Google%20Sheets-brightgreen?logo=googlesheets)](https://docs.google.com/spreadsheets/d/1YKzqywmFj9cu0uYQhVGIndmnL4roYV3gYIe4OXoCxL0)

---

## 📋 Tentang Projek

Portal ini adalah direktori awam pengusaha ternakan Malaysia yang dibangunkan untuk tujuan **hebahan dan networking** dalam ekosistem industri ternakan negara. Data bersumber dari Google Sheets dan diurus melalui Google Apps Script (GAS) sebagai backend API.

### Ciri-ciri Utama

| Ciri | Status |
|------|--------|
| 📋 Direktori awam dengan carian & penapis | ✅ Aktif |
| ✏️ Borang pendaftaran pengusaha baru | ✅ Aktif |
| 🔑 Log masuk OTP melalui e-mel | ✅ Aktif |
| ⚙️ Panel admin dengan kelulusan/penolakan rekod | ✅ Aktif |
| 📊 Statistik langsung (jumlah, negeri, jenis) | ✅ Aktif |
| 📧 Notifikasi e-mel automatik | ✅ Aktif |
| 🔒 Perlindungan data (PDPA 2010) | ✅ Aktif |
| 📱 Responsif (mobile-friendly) | ✅ Aktif |

---

## 🏗️ Seni Bina Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB PAGES                              │
│               index.html (Frontend SPA)                     │
│   • Direktori    • Pendaftaran    • Admin Panel              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP POST/GET (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE APPS SCRIPT (Backend API)                │
│   GAS ID: 1QrOl4O085g_6tavM10CLCnWJ7a-smgi...              │
│                                                             │
│   GET  /exec?action=getDirectory    → data awam             │
│   GET  /exec?action=getStats        → statistik             │
│   POST action=requestOtp            → hantar OTP e-mel      │
│   POST action=verifyOtp             → sahkan & beri token   │
│   POST action=submitForm            → daftar pengusaha baru │
│   POST action=approveRecord         → admin: lulus          │
│   POST action=rejectRecord          → admin: tolak          │
│   POST action=getAdminData          → admin: semua data     │
│   POST action=bulkApprove           → admin: lulus pukal    │
└──────────────────────────┬──────────────────────────────────┘
                           │ SpreadsheetApp API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   GOOGLE SHEETS                              │
│   ID: 1YKzqywmFj9cu0uYQhVGIndmnL4roYV3gYIe4OXoCxL0        │
│                                                             │
│   ├── Form Responses 1  → data utama (semua pendaftaran)    │
│   ├── DataBersih        → data yang telah diluluskan        │
│   └── AuditLog          → log semua tindakan admin          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Struktur Fail

```
listpengusaha/
├── index.html          # Frontend SPA (HTML + CSS + JS)
├── Code.gs             # GAS Backend (salin ke editor GAS)
├── appsscript.json     # Manifest GAS
└── README.md           # Dokumentasi ini
```

---

## 🚀 Panduan Pemasangan

### 1. Google Sheets — Sediakan Sheet

Buka spreadsheet dan pastikan sheet-sheet berikut wujud:

| Sheet | Fungsi |
|-------|--------|
| `Form Responses 1` | Data utama dari pendaftaran |
| `DataBersih` | Data yang telah diluluskan (auto-dicipta) |
| `AuditLog` | Log tindakan admin (auto-dicipta) |

**Lajur dalam `Form Responses 1`** (mengikut urutan):

| Kolum | Nama Header |
|-------|------------|
| A | Timestamp |
| B | NAMA INDIVIDU, SYARIKAT ATAU LADANG |
| C | NO TELEFON (WHATSAPP) |
| D | NEGERI |
| E | LOKASI LADANG |
| F | Facebook URL Ladang atau Peribadi |
| G | Email address |
| H | JENIS PERUSAHAAN |
| I | SAYA SETUJU... (persetujuan) |
| J | Status |
| K | ApprovedBy |
| L | ApprovedAt |
| M | UpdatedAt |
| N | ReviewNote |

---

### 2. Google Apps Script — Deploy Backend

1. Buka [script.google.com](https://script.google.com) dan buka projek GAS:  
   ID: `1QrOl4O085g_6tavM10CLCnWJ7a-smgieDN2i7zKTpJ4-2TYVzeAD754p`

2. **Padam** semua kod lama dan **tampalkan** kandungan `Code.gs` dari repo ini.

3. Kemaskini `appsscript.json` dengan kandungan dari repo ini (klik ikon ⚙️ > Project Settings > Enable "Show appsscript.json file in editor").

4. Jalankan **`setupSheets()`** sekali untuk mencipta sheet `DataBersih` dan `AuditLog`.

5. Jalankan **`migrateApproveOldRecords()`** sekali untuk meluluskan semua data lama.

6. **Deploy sebagai Web App:**
   - Klik **Deploy > New Deployment**
   - Type: **Web app**
   - Execute as: **Me (itumelaka@gmail.com)**
   - Who has access: **Anyone**
   - Klik **Deploy**
   - **Salin URL Web App** yang dijana

7. **Kemaskini `GAS_URL`** dalam `index.html`:
   ```javascript
   // Gantikan baris ini:
   const GAS_URL = 'https://script.google.com/macros/s/AKfycbxPLACEHOLDER_REPLACE_WITH_DEPLOYED_URL/exec';
   
   // Dengan URL sebenar anda:
   const GAS_URL = 'https://script.google.com/macros/s/AKfycbx...YOUR_REAL_URL.../exec';
   ```

---

### 3. GitHub Pages — Deploy Frontend

```bash
# Clone repo (atau buat baru)
git clone https://github.com/itumelaka/listpengusaha.git
cd listpengusaha

# Kemaskini GAS_URL dalam index.html

# Commit dan push
git add .
git commit -m "kemaskini: sistem v2 - panel admin, OTP, filter"
git push origin main
```

Laman akan tersedia di: `https://itumelaka.github.io/listpengusaha/`

---

## 🔑 Aliran Log Masuk (OTP)

```
Pengguna masukkan e-mel
        │
        ▼
GAS: jana OTP 6 digit
GAS: simpan dalam ScriptProperties (tamat 10 minit)
GAS: hantar e-mel OTP
        │
        ▼
Pengguna masukkan kod OTP
        │
        ▼
GAS: sahkan kod + tamat tempoh
GAS: beri token sesi
        │
        ├── e-mel admin → akses Panel Admin
        └── e-mel lain  → akses biasa
```

---

## ⚙️ Konfigurasi GAS (`Code.gs`)

```javascript
const CONFIG = {
  SPREADSHEET_ID: '1YKzqywmFj9cu0uYQhVGIndmnL4roYV3gYIe4OXoCxL0',
  SHEET_RESPONSES: 'Form Responses 1',
  SHEET_CLEANED:   'DataBersih',
  SHEET_AUDIT:     'AuditLog',
  ADMIN_EMAIL:     'itumelaka@gmail.com',   // ← tukar jika perlu
  OTP_EXPIRY_MIN:  10,
};
```

---

## 📊 Contoh Respons API

### GET ?action=getDirectory

```json
{
  "status": "ok",
  "count": 112,
  "data": [
    {
      "id": 1,
      "nama": "VARSITY AGRO FARM",
      "jenis": "Ternakan Ayam",
      "negeri": "Selangor",
      "lokasi": "Shah Alam Selangor",
      "wa": "+60178806816",
      "fb": "https://facebook.com/varsityagrofarming",
      "timestamp": "22/02/2024 18:55:15"
    }
  ],
  "updated": "2026-06-26T10:00:00.000Z"
}
```

### POST action=requestOtp

```json
// Request
{ "action": "requestOtp", "email": "user@example.com" }

// Response
{ "status": "ok", "message": "Kod OTP telah dihantar ke user@example.com. Sah selama 10 minit." }
```

---

## 🛡️ Keselamatan

- OTP disimpan dalam **ScriptProperties** (bukan spreadsheet atau cache awam)
- Token sesi menggunakan **base64 + MD5 hash** (cukup untuk demo/MVP)
- Pengesahan admin **berdasarkan e-mel** dalam `CONFIG.ADMIN_EMAIL`
- Semua input di-**sanitize** sebelum dipaparkan (XSS protection)
- Nombor telefon hanya dipaparkan dalam format link WhatsApp
- E-mel pengguna **tidak didedahkan** kepada awam dalam direktori

> ⚠️ **Nota Keselamatan Produksi:** Untuk penggunaan produksi penuh, pertimbangkan untuk menggantikan token sesi dengan JWT yang ditandatangani dengan betul dan menggunakan Google Cloud Secret Manager untuk konfigurasi sensitif.

---

## 📧 Aliran E-mel Automatik

| Peristiwa | Penerima | Kandungan |
|-----------|----------|-----------|
| OTP diminta | Pemohon | Kod OTP 6 digit |
| Pendaftaran baru | Pemohon | Pengesahan penerimaan |
| Pendaftaran baru | Admin | Notifikasi dengan butiran |

---

## 🔄 Kemaskini & Penyelenggaraan

### Tambah Admin Baru
Tukar `ADMIN_EMAIL` dalam `Code.gs` atau tambah logik multi-admin dalam `verifyAdminSession()`.

### Migration Data Lama
Jalankan `migrateApproveOldRecords()` dari editor GAS untuk meluluskan semua rekod lama yang tiada status.

### Re-deploy selepas kemaskini kod
Setiap kali kod GAS dikemaskini, perlu buat **New Deployment** baru dan kemaskini `GAS_URL` dalam `index.html`.

---

## 📞 Hubungi

- **E-mel:** itumelaka@gmail.com  
- **Portal:** https://itumelaka.github.io/listpengusaha/  
- **Data:** https://docs.google.com/spreadsheets/d/1YKzqywmFj9cu0uYQhVGIndmnL4roYV3gYIe4OXoCxL0

---

## 📜 Lesen

© 2026 Portal Direktori Pengusaha Ternakan DVS Malaysia  
Inisiatif Institut Teknologi Unggas 2026  
Jabatan Perkhidmatan Veterinar Malaysia | Kementerian Pertanian & Keterjaminan Makanan Malaysia
