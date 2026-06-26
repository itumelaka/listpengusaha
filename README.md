# Portal Direktori Pengusaha Ternakan Malaysia

**Jabatan Perkhidmatan Veterinar (DVS) Malaysia**  
Inisiatif Institut Teknologi Unggas 2026

---

## Live Demo

https://itumelaka.github.io/listpengusaha/

---

## Tentang Portal Ini

Portal ini menyediakan direktori pengusaha ternakan Malaysia yang boleh diakses oleh orang awam dan pengusaha lain untuk tujuan hebahan dan networking.

### Ciri-ciri Utama

- **Log Masuk Email + OTP sebenar** — OTP mesti dihantar dan disahkan melalui backend/API yang selamat.
- **Direktori Awam** — Senarai pengusaha yang telah diluluskan dan bersetuju untuk dikongsikan.
- **Borang Pendaftaran** — Pengusaha baru boleh menghantar maklumat untuk semakan.
- **Carian & Penapis** — Mengikut negeri dan jenis perusahaan.
- **Responsive** — Sesuai untuk desktop dan mudah alih.
- **Paparan data lebih selamat** — Data dari Google Sheets di-escape sebelum dimasukkan ke HTML.

> Nota keselamatan: GitHub Pages ialah static hosting. Ia tidak boleh menyimpan secret email provider, API key, atau logic OTP dengan selamat. OTP production wajib menggunakan backend/serverless API seperti Google Apps Script, Cloudflare Workers, Vercel Functions, Firebase Functions, atau backend sendiri.

---

## Konfigurasi OTP Production

Frontend di `index.html` menggunakan constant berikut:

```javascript
const AUTH_API_BASE = '';
const REQUEST_OTP_ENDPOINT = AUTH_API_BASE ? `${AUTH_API_BASE}/otp/request` : '';
const VERIFY_OTP_ENDPOINT = AUTH_API_BASE ? `${AUTH_API_BASE}/otp/verify` : '';
```

Tetapkan `AUTH_API_BASE` kepada URL backend/API production, contohnya:

```javascript
const AUTH_API_BASE = 'https://api.example.gov.my/listpengusaha';
```

### API Contract

#### POST `/otp/request`

Request:

```json
{
  "email": "user@example.com"
}
```

Response berjaya:

```json
{
  "ok": true
}
```

Backend perlu:

- Jana OTP secara server-side sahaja.
- Hash OTP sebelum simpan.
- Tetapkan expiry pendek, contohnya 5-10 minit.
- Rate-limit mengikut email dan IP.
- Hantar OTP melalui email provider server-side.
- Jangan pulangkan OTP dalam response API.

#### POST `/otp/verify`

Request:

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response berjaya:

```json
{
  "ok": true
}
```

Backend perlu:

- Sahkan hash OTP dan expiry.
- Padam atau invalidate OTP selepas berjaya digunakan.
- Rate-limit cubaan OTP yang gagal.
- Set session/cookie atau pulangkan token yang sesuai jika perlu kawalan akses lanjutan.

---

## Struktur Google Sheets Yang Disarankan

Untuk mengelakkan data mentah/private terdedah kepada public static site, asingkan tab dalaman dan tab awam.

### Tabs

| Tab | Tujuan | Akses |
| --- | --- | --- |
| `Submissions_Raw` | Data mentah daripada borang pendaftaran. | Private/internal sahaja. |
| `Approved_Public` | Data yang sudah disemak dan diluluskan untuk paparan awam. | Boleh dibaca oleh website public. |
| `Lookup_Negeri_Jenis` | Senarai negeri dan jenis perusahaan untuk rujukan/lookup. | Internal atau read-only mengikut keperluan. |
| `Audit_Log` | Rekod semakan, kelulusan, penolakan, dan perubahan status. | Private/internal sahaja. |

Public website hanya patut membaca data daripada tab `Approved_Public`. Jangan jadikan `Submissions_Raw` sebagai "Anyone with the link can view" kerana tab itu boleh mengandungi data mentah/private. Untuk GitHub Pages static site, hanya public approved sheet/tab yang patut exposed.

---

## Struktur Kolum Google Sheets

Gunakan struktur kolum berikut untuk `Submissions_Raw` dan salurkan rekod yang lulus ke `Approved_Public`.

| Kolum | Nama Kolum |
| --- | --- |
| A | Timestamp |
| B | Nama Individu / Syarikat / Ladang |
| C | No. Telefon / WhatsApp |
| D | Negeri |
| E | Lokasi Ladang |
| F | Facebook URL |
| G | Email Address |
| H | Jenis Perusahaan |
| I | Persetujuan Perkongsian Data |
| J | Status |
| K | ApprovedBy |
| L | ApprovedAt |
| M | UpdatedAt |
| N | ReviewNote |

### Nilai Status

- `Pending`
- `Approved`
- `Rejected`
- `Needs Review`

### Peraturan Paparan Awam

Direktori awam hanya boleh memaparkan rekod yang memenuhi kedua-dua syarat ini:

- `Status = Approved`
- `Persetujuan Perkongsian Data = Ya/Setuju`

Rekod dengan status `Pending`, `Rejected`, atau `Needs Review` tidak boleh dipaparkan di direktori awam.

---

## Setup & Deployment

### 1. Dapatkan salinan repo jika diperlukan

```bash
git clone https://github.com/itumelaka/listpengusaha.git
```

### 2. Konfigurasi Google Sheets Public Approved

Buka `index.html` dan tukar nilai berikut kepada ID dan GID tab `Approved_Public` sahaja:

```javascript
const PUBLIC_SHEET_ID = 'YOUR_PUBLIC_APPROVED_GOOGLE_SHEET_ID';
const PUBLIC_GID = 'YOUR_APPROVED_PUBLIC_GID';
```

Pastikan hanya tab/sheet public approved yang diperlukan oleh website diberi akses baca awam. Data mentah dalam `Submissions_Raw` perlu kekal private/internal.

### 3. Konfigurasi OTP Backend/API

Tetapkan `AUTH_API_BASE` kepada URL backend/API production yang melaksanakan `/otp/request` dan `/otp/verify`. Template Cloudflare Worker disediakan di `backend/cloudflare-worker-otp.js`, dengan nota ringkas di `backend/README.md`.

### 4. GitHub Pages

- Pergi ke Settings > Pages.
- Source: main branch, folder / (root).
- Save dan tunggu beberapa minit.

---

## Teknologi

- HTML5 / CSS3 / Vanilla JavaScript
- Google Sheets API (gviz/tq)
- Google Fonts (Plus Jakarta Sans)
- GitHub Pages (hosting)
- Backend/API berasingan untuk OTP production

---

## Security Checklist

- Jangan letak email provider secret/API key dalam `index.html`.
- Jangan pulangkan OTP dari backend kepada frontend.
- Gunakan HTTPS sahaja untuk `AUTH_API_BASE`.
- Aktifkan CORS hanya untuk domain GitHub Pages yang digunakan.
- Rate-limit endpoint OTP.
- Simpan OTP sebagai hash dan tetapkan expiry pendek.
- Paparkan hanya data `Approved_Public` yang sudah disemak.

---

## Hubungi

Jabatan Perkhidmatan Veterinar Malaysia  
Kementerian Pertanian & Keterjaminan Makanan  
Website: www.dvs.gov.my

---

Copyright © 2026 — Inisiatif Institut Teknologi Unggas 2026
