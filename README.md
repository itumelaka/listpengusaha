# Portal Direktori Pengusaha Ternakan DVS Malaysia

> Inisiatif Institut Teknologi Unggas 2026  
> Jabatan Perkhidmatan Veterinar Malaysia | Kementerian Pertanian & Keterjaminan Makanan

[![Live Demo](https://img.shields.io/badge/Live-GitHub%20Pages-green?logo=github)](https://itumelaka.github.io/listpengusaha/)
[![Backend](https://img.shields.io/badge/Backend-Google%20Apps%20Script-blue?logo=google)](https://script.google.com)
[![Map](https://img.shields.io/badge/Map-Leaflet%20%2B%20OpenStreetMap-brightgreen)](https://leafletjs.com/)

---

## Tentang Projek

Portal direktori awam pengusaha ternakan Malaysia untuk tujuan hebahan, networking, dan semakan pentadbiran. Frontend berjalan di GitHub Pages, backend menggunakan Google Apps Script (GAS), dan data disimpan dalam Google Sheets.

Live demo: https://itumelaka.github.io/listpengusaha/

---

## Ciri Utama

| Ciri | Status |
|------|--------|
| Direktori pengusaha dengan carian dan penapis | Siap |
| Peta sebenar Leaflet + OpenStreetMap | Siap |
| Marker peta ikut negeri | Siap |
| Borang pendaftaran pengusaha | Siap |
| OTP e-mel melalui Google Apps Script | Siap |
| Panel admin tersembunyi | Siap |
| Admin approve / reject / bulk approve | Siap |
| Export CSV dan PDF | Siap |
| Frontend hardening untuk XSS/link luar | Siap |

Nota peta: marker semasa diplot pada titik negeri kerana data asal belum ada latitude/longitude ladang. Untuk plot lokasi ladang sebenar, tambah kolum Latitude dan Longitude dalam sheet approved/public.

---

## Struktur Sistem

```
GitHub Pages (index.html)
  - Direktori
  - Peta Leaflet/OpenStreetMap
  - Borang daftar
  - UI admin
        |
        | GET/POST JSON
        v
Google Apps Script Web App
  - getDirectory
  - submitForm
  - requestOtp / verifyOtp
  - getAdminData
  - approveRecord / rejectRecord / bulkApprove
        |
        v
Google Sheets
  - Submissions_Raw / Form responses
  - Approved_Public
  - Lookup_Negeri_Jenis
  - Audit_Log
```

---

## URL Penting

| Item | URL |
|------|-----|
| Website public | https://itumelaka.github.io/listpengusaha/ |
| Repository | https://github.com/itumelaka/listpengusaha |
| Google Sheet | https://docs.google.com/spreadsheets/d/1YKzqywmFj9cu0uYQhVGIndmnL4roYV3gYIe4OXoCxL0 |
| GAS Project ID | `1QrOl4O085g_6tavM10CLCnWJ7a-smgieDN2i7zKTpJ4-2TYVzeAD754p` |

---

## Struktur Google Sheets Disarankan

Tabs:

| Tab | Kegunaan |
|-----|----------|
| `Submissions_Raw` / `Form responses 1` | Data mentah daripada borang. Private/internal sahaja. |
| `Approved_Public` | Data yang sudah disemak dan diluluskan untuk paparan awam. |
| `Lookup_Negeri_Jenis` | Senarai negeri dan jenis perusahaan. |
| `Audit_Log` | Rekod semakan, kelulusan, penolakan, dan admin action. |

Public website hanya patut baca data daripada `Approved_Public` atau endpoint GAS yang hanya return rekod approved. Jangan expose raw response sheet kepada public.

---

## Kolum Data Pengusaha

| Kolum | Nama |
|-------|------|
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

Status values:

- Pending
- Approved
- Rejected
- Needs Review

Direktori awam hanya boleh papar rekod yang:

- `Status = Approved`
- `Persetujuan Perkongsian Data = Ya / Setuju / Yes / True`

---

## Peta

Peta menggunakan:

- Leaflet
- OpenStreetMap tile layer
- Marker agregat mengikut negeri

Fasa seterusnya untuk peta lebih tepat:

| Kolum tambahan | Kegunaan |
|----------------|----------|
| Latitude | Koordinat latitud ladang/lokasi |
| Longitude | Koordinat longitud ladang/lokasi |
| GeoAccuracy | Tahap ketepatan geocode, contoh negeri/daerah/alamat |

Elakkan geocode alamat penuh secara public jika data lokasi dianggap sensitif. Untuk public directory, plot daerah/negeri mungkin lebih selamat daripada titik ladang sebenar.

---

## OTP dan Admin

OTP e-mel diproses melalui Google Apps Script, bukan client-side demo. Frontend hanya memanggil endpoint GAS.

Keperluan security backend:

- OTP ada expiry.
- OTP ada rate limit.
- OTP verify ada max attempts.
- Admin email allowlist mesti disemak di GAS.
- Semua action admin mesti validate token di GAS.
- Jangan percaya `sessionStorage`, `isAdmin`, atau data daripada browser sebagai bukti authorization.

---

## Frontend Security

Frontend telah dikemas untuk:

- Escape data sebelum render dalam jadual.
- Elak message server dimasukkan terus sebagai raw HTML.
- Validasi URL Facebook dan WhatsApp sebelum dijadikan link.
- Guna `rel="noopener noreferrer"` pada external links.
- Elak template PDF memecahkan main `<script>`.

Had penting: security sebenar untuk data/admin tetap perlu enforced di GAS/backend.

---

## Kemaskini dan Deploy

### GitHub Pages

Edit fail terus di GitHub repository dan commit ke branch `main`. GitHub Pages akan auto-deploy selepas workflow selesai.

### Google Apps Script

Jika `Code.gs` berubah:

1. Buka Apps Script project.
2. Tampal kod terkini dalam `Code.gs`.
3. Save project.
4. Deploy -> Manage deployments -> Edit -> New version -> Deploy.

URL Web App boleh kekal sama jika update deployment sedia ada.

---

## Fail Utama

| Fail | Kegunaan |
|------|----------|
| `index.html` | Portal utama, direktori, peta, borang, admin UI |
| `README.md` | Dokumentasi projek |
| `backend/` | Rujukan backend/worker yang pernah disediakan |
| `wrangler.toml` | Rujukan konfigurasi Cloudflare Worker, jika digunakan kemudian |

---

## Clone Repository

```bash
git clone https://github.com/itumelaka/listpengusaha.git
```

Clone hanya diperlukan jika mahu pembangunan local. Untuk perubahan kecil, GitHub web editor sudah memadai.

---

## Hubungi

- E-mel: itumelaka@gmail.com
- Portal: https://itumelaka.github.io/listpengusaha/

---

## Hakcipta

© 2026 Portal Direktori Pengusaha Ternakan DVS Malaysia  
Inisiatif Institut Teknologi Unggas 2026  
Jabatan Perkhidmatan Veterinar Malaysia | Kementerian Pertanian & Keterjaminan Makanan Malaysia
