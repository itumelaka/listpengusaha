# 🐄 Portal Direktori Pengusaha Ternakan DVS Malaysia

> **Inisiatif Institut Teknologi Unggas 2026**  
> Jabatan Perkhidmatan Veterinar Malaysia | Kementerian Pertanian & Keterjaminan Makanan

[![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-green?logo=github)](https://itumelaka.github.io/listpengusaha/)
[![GAS Backend](https://img.shields.io/badge/Backend-Google%20Apps%20Script-blue?logo=google)](https://script.google.com)
[![Data](https://img.shields.io/badge/Data-Google%20Sheets-brightgreen?logo=googlesheets)](https://docs.google.com/spreadsheets/d/1YKzqywmFj9cu0uYQhVGIndmnL4roYV3gYIe4OXoCxL0)

---

## 📋 Tentang Projek

Portal direktori awam pengusaha ternakan Malaysia untuk tujuan **hebahan dan networking** dalam ekosistem industri ternakan negara. Data bersumber dari Google Sheets dan diurus melalui Google Apps Script (GAS) sebagai backend API.

---

## 🌐 URL Penting

| Halaman | URL |
|---------|-----|
| Portal Utama (Penternak) | https://itumelaka.github.io/listpengusaha/ |
| Direktori Pelajar & Graduan | https://itumelaka.github.io/listpengusaha/students.html |
| Spreadsheet Data | https://docs.google.com/spreadsheets/d/1YKzqywmFj9cu0uYQhVGIndmnL4roYV3gYIe4OXoCxL0 |
| GAS Project | https://script.google.com (ID: 1QrOl4O085g_6tavM10CLCnWJ7a-smgieDN2i7zKTpJ4-2TYVzeAD754p) |

---

## ✅ Ciri-ciri Sistem

### Portal Utama (`index.html`)
| Ciri | Status |
|------|--------|
| Direktori 107+ pengusaha dengan carian & penapis | ✅ |
| Statistik langsung (jumlah, negeri, jenis) | ✅ |
| Bahagian penerangan — networking & LI pelajar | ✅ |
| Borang pendaftaran pengusaha baru | ✅ |
| Panel Admin — akses rahsia (klik copyright 5x) | ✅ |
| Admin: lulus / tolak / lulus pukal rekod | ✅ |
| Admin: export Excel (CSV) & PDF | ✅ |
| E-mel notifikasi auto (pemohon & admin) | ✅ |
| Responsif mobile-friendly | ✅ |

### Halaman Pelajar (`students.html`)
| Ciri | Status |
|------|--------|
| Direktori pelajar & graduan dengan kad profil | ✅ |
| Papar nombor WA & e-mel terus dalam kad | ✅ |
| Carian & penapis (negeri, tujuan, tahap) | ✅ |
| Borang daftar pelajar baru | ✅ |
| Export CSV data pelajar | ✅ |
| Auto-approve pendaftaran pelajar | ✅ |

---

## 🏗️ Seni Bina Sistem

```
┌─────────────────────────────────────────────────────┐
│              GITHUB PAGES (Frontend)                 │
│   index.html          students.html                 │
│   • Direktori          • Direktori Pelajar          │
│   • Daftar             • Borang Daftar              │
│   • Panel Admin        • Export CSV                 │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP GET/POST (JSON)
                   ▼
┌─────────────────────────────────────────────────────┐
│         GOOGLE APPS SCRIPT (Backend API v2)          │
│                                                     │
│  GET  ?action=getDirectory   → data pengusaha awam  │
│  GET  ?action=getStudents    → data pelajar awam    │
│  GET  ?action=getStats       → statistik            │
│  POST action=submitForm      → daftar pengusaha     │
│  POST action=submitStudent   → daftar pelajar       │
│  POST action=requestOtp      → hantar OTP e-mel     │
│  POST action=verifyOtp       → sahkan & beri token  │
│  POST action=approveRecord   → admin: lulus         │
│  POST action=rejectRecord    → admin: tolak         │
│  POST action=getAdminData    → admin: semua data    │
│  POST action=bulkApprove     → admin: lulus pukal   │
└──────────────────┬──────────────────────────────────┘
                   │ SpreadsheetApp API
                   ▼
┌─────────────────────────────────────────────────────┐
│              GOOGLE SHEETS (Database)                │
│                                                     │
│  Form Responses 1  → data pengusaha utama           │
│  Pelajar           → data pelajar & graduan         │
│  DataBersih        → data diluluskan (rujukan)      │
│  AuditLog          → log semua tindakan admin       │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Struktur Fail

```
listpengusaha/
├── index.html        # Portal utama (pengusaha)
├── students.html     # Portal pelajar & graduan
├── Code.gs           # GAS Backend (salin ke editor GAS)
├── appsscript.json   # Manifest GAS
└── README.md         # Dokumentasi ini
```

---

## 🚀 Panduan Deploy Semula (bila update)

### GAS Backend
1. Buka `https://raw.githubusercontent.com/itumelaka/listpengusaha/main/Code.gs`
2. **Ctrl+A** → **Ctrl+C**
3. Buka GAS Editor → **Ctrl+A** → **Ctrl+V** → **Ctrl+S**
4. **Deploy → Manage deployments → ✏️ → New version → Deploy**

> ⚠️ URL GAS kekal sama bila guna Manage deployments — tak perlu kemaskini `index.html`

### GitHub Pages
```bash
git add .
git commit -m "kemaskini: [huraian]"
git push origin main
```
GitHub Pages auto-deploy dalam 1-2 minit.

---

## 🔑 Akses Panel Admin

**Cara masuk:** Klik perkataan **"Copyright © 2026"** di footer sebanyak **5 kali** dalam masa 3 saat.

- Popup login muncul
- Masukkan e-mel admin
- Kod OTP dihantar ke e-mel
- Masukkan OTP → akses panel admin

**E-mel admin:** `itumelaka@gmail.com`

---

## ⚙️ Konfigurasi GAS (`Code.gs`)

```javascript
const CONFIG = {
  SPREADSHEET_ID:  '1YKzqywmFj9cu0uYQhVGIndmnL4roYV3gYIe4OXoCxL0',
  SHEET_RESPONSES: 'Form Responses 1',
  SHEET_STUDENTS:  'Pelajar',
  SHEET_CLEANED:   'DataBersih',
  SHEET_AUDIT:     'AuditLog',
  ADMIN_EMAIL:     'itumelaka@gmail.com',
  OTP_EXPIRY_MIN:  10,
};
```

---

## 🔧 Fungsi Utiliti GAS (jalankan sekali dari Editor)

| Fungsi | Kegunaan |
|--------|----------|
| `setupSheets()` | Cipta sheet DataBersih & AuditLog |
| `migrateApproveOldRecords()` | Lulus semua rekod lama secara pukal |
| `testEndpoint()` | Test API getDirectory |
| `testEmail()` | Test penghantaran e-mel |

---

## 📊 Struktur Lajur Google Sheets

### Sheet: `Form Responses 1`
| Lajur | Nama |
|-------|------|
| A | Timestamp |
| B | Nama Individu / Syarikat / Ladang |
| C | No. Telefon (WhatsApp) |
| D | Negeri |
| E | Lokasi Ladang |
| F | Facebook URL |
| G | Email address |
| H | Jenis Perusahaan |
| I | Persetujuan (SETUJU) |
| J | Status (APPROVED/PENDING/REJECTED) |
| K | ApprovedBy |
| L | ApprovedAt |
| M | UpdatedAt |
| N | ReviewNote |

### Sheet: `Pelajar`
| Lajur | Nama |
|-------|------|
| A | Timestamp |
| B | Nama |
| C | WA |
| D | Email |
| E | Negeri |
| F | Universiti |
| G | Tahap |
| H | Bidang |
| I | Tujuan |
| J | Tempoh |
| K | Bio |
| L | Setuju |
| M | Status |

---

## 🛡️ Keselamatan

- OTP disimpan dalam **ScriptProperties** — tidak boleh diakses awam
- Pengesahan admin berdasarkan e-mel dalam `CONFIG.ADMIN_EMAIL`
- Semua input di-sanitize (XSS protection)
- Token sesi base64 untuk session management
- Perlindungan duplikat pendaftaran (24-48 jam)

---

## 📞 Hubungi

- **E-mel:** itumelaka@gmail.com
- **Portal:** https://itumelaka.github.io/listpengusaha/

---

## 📜 Hakcipta

© 2026 Portal Direktori Pengusaha Ternakan DVS Malaysia  
Inisiatif Institut Teknologi Unggas 2026  
Jabatan Perkhidmatan Veterinar Malaysia | Kementerian Pertanian & Keterjaminan Makanan Malaysia
