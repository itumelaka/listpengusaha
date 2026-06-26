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

- **Log Masuk Demo Email + OTP — Untuk simulasi akses sahaja, bukan pengesahan sebenar.**
- **Direktori Awam** — Senarai pengusaha yang telah diluluskan dan bersetuju untuk dikongsikan.
- **Borang Pendaftaran** — Pengusaha baru boleh menghantar maklumat untuk semakan.
- **Carian & Penapis** — Mengikut negeri dan jenis perusahaan.
- **Responsive** — Sesuai untuk desktop dan mudah alih.

> Nota keselamatan: OTP dalam versi ini ialah demo client-side untuk tujuan simulasi/testing sahaja. Untuk production, OTP sebenar mesti dijana, dihantar, dan disahkan melalui backend/API yang selamat, bukan melalui kod frontend statik.

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

### 3. GitHub Pages

- Pergi ke Settings > Pages.
- Source: main branch, folder / (root).
- Save dan tunggu beberapa minit.

---

## Teknologi

- HTML5 / CSS3 / Vanilla JavaScript
- Google Sheets API (gviz/tq)
- Google Fonts (Plus Jakarta Sans)
- GitHub Pages (hosting)

---

## Hubungi

Jabatan Perkhidmatan Veterinar Malaysia  
Kementerian Pertanian & Keterjaminan Makanan  
Website: www.dvs.gov.my

---

Copyright © 2026 — Inisiatif Institut Teknologi Unggas 2026
