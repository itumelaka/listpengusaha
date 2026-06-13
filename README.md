# 🐄 Portal Direktori Pengusaha Ternakan Malaysia

**Jabatan Perkhidmatan Veterinar (DVS) Malaysia**  
Inisiatif Institut Teknologi Unggas 2026

---

## 🔗 Live Demo
👉 **[https://itumelaka-sudo.github.io/listpengusaha](https://itumelaka-sudo.github.io/listpengusaha)**

---

## 📋 Tentang Portal Ini

Portal ini menyediakan direktori pengusaha ternakan Malaysia yang boleh diakses oleh orang awam dan pengusaha lain untuk tujuan **hebahan dan networking**.

### Ciri-ciri Utama:
- 🔐 **Log Masuk Email + OTP** — Sistem pengesahan dua faktor
- 📋 **Direktori Awam** — Senarai pengusaha yang bersetuju dikongsikan
- ✏️ **Borang Pendaftaran** — Pengusaha baru boleh mendaftar maklumat
- 🔍 **Carian & Penapis** — Mengikut negeri dan jenis perusahaan
- 📱 **Responsive** — Sesuai untuk desktop dan mudah alih

---

## 📊 Struktur Data (Google Sheets)

| Kolum | Penerangan |
|-------|-----------|
| A | Timestamp |
| B | Nama Individu / Syarikat / Ladang |
| C | No. Telefon (WhatsApp) |
| D | Negeri |
| E | Lokasi Ladang |
| F | Facebook URL |
| G | Email Address |
| H | Jenis Perusahaan |
| I | Persetujuan Perkongsian Data |

---

## 🚀 Setup & Deployment

### 1. Clone Repo
```bash
git clone https://github.com/itumelaka-sudo/listpengusaha.git
cd listpengusaha
```

### 2. Konfigurasi Google Sheets
Buka `index.html` dan tukar nilai berikut:
```javascript
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
const GID = 'YOUR_GID';
```
Pastikan spreadsheet ditetapkan kepada **"Anyone with the link can view"**.

### 3. GitHub Pages
- Pergi ke **Settings → Pages**
- Source: `main` branch, folder `/` (root)
- Save dan tunggu beberapa minit

---

## 🛠️ Teknologi

- HTML5 / CSS3 / Vanilla JavaScript
- Google Sheets API (gviz/tq)
- Google Fonts (Plus Jakarta Sans)
- GitHub Pages (hosting)

---

## 📞 Hubungi

**Jabatan Perkhidmatan Veterinar Malaysia**  
Kementerian Pertanian & Keterjaminan Makanan  
Website: [www.dvs.gov.my](https://www.dvs.gov.my)

---

*Copyright © 2026 — Inisiatif Institut Teknologi Unggas 2026*
