# OTP Backend Template

Template ini menyediakan backend OTP sebenar untuk frontend GitHub Pages.

Platform sasaran: Cloudflare Workers + KV + Resend email API.

## Endpoint

- `POST /otp/request` - jana OTP server-side, simpan hash dalam KV, dan hantar OTP ke e-mel.
- `POST /otp/verify` - semak OTP, hadkan cubaan gagal, dan invalidate OTP selepas berjaya.

## Environment / Secret Yang Diperlukan

- `OTP_KV` - Cloudflare KV binding.
- `OTP_PEPPER` - secret rawak panjang untuk hashing OTP.
- `RESEND_API_KEY` - API key Resend.
- `OTP_FROM_EMAIL` - alamat e-mel pengirim yang sudah verified di Resend.
- `ALLOWED_ORIGIN` - origin GitHub Pages, contohnya `https://itumelaka.github.io`.

## Sambung Ke Frontend

Selepas Worker deploy, set di `index.html`:

```javascript
const AUTH_API_BASE = 'https://your-worker.your-subdomain.workers.dev';
```

Jangan letak `RESEND_API_KEY`, `OTP_PEPPER`, atau secret lain dalam `index.html`.
