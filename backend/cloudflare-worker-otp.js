export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      if (request.method === 'POST' && url.pathname === '/otp/request') {
        return await requestOtp(request, env, corsHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/otp/verify') {
        return await verifyOtp(request, env, corsHeaders);
      }
      return json({ ok: false, error: 'Not found' }, 404, corsHeaders);
    } catch (error) {
      return json({ ok: false, error: 'Server error' }, 500, corsHeaders);
    }
  }
};

const OTP_TTL_SECONDS = 600;
const REQUEST_LIMIT_TTL_SECONDS = 3600;
const MAX_REQUESTS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

async function requestOtp(request, env, corsHeaders) {
  assertEnv(env);
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!email) return json({ ok: false, error: 'Invalid email' }, 400, corsHeaders);

  const rateKey = 'otp:rate:' + email;
  const currentCount = Number(await env.OTP_KV.get(rateKey) || '0');
  if (currentCount >= MAX_REQUESTS_PER_HOUR) {
    return json({ ok: false, error: 'Too many OTP requests' }, 429, corsHeaders);
  }
  await env.OTP_KV.put(rateKey, String(currentCount + 1), { expirationTtl: REQUEST_LIMIT_TTL_SECONDS });

  const otp = generateOtp();
  const hash = await hashOtp(email, otp, env.OTP_PEPPER);
  await env.OTP_KV.put(otpKey(email), JSON.stringify({ hash, attempts: 0 }), { expirationTtl: OTP_TTL_SECONDS });
  await sendEmail(env, email, otp);

  return json({ ok: true }, 200, corsHeaders);
}

async function verifyOtp(request, env, corsHeaders) {
  assertEnv(env);
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const otp = String(body.otp || '').replace(/[^0-9]/g, '');
  if (!email || otp.length !== 6) return json({ ok: false, error: 'Invalid OTP' }, 400, corsHeaders);

  const key = otpKey(email);
  const recordText = await env.OTP_KV.get(key);
  if (!recordText) return json({ ok: false, error: 'OTP expired' }, 401, corsHeaders);

  const record = JSON.parse(recordText);
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    await env.OTP_KV.delete(key);
    return json({ ok: false, error: 'Too many attempts' }, 429, corsHeaders);
  }

  const hash = await hashOtp(email, otp, env.OTP_PEPPER);
  if (hash !== record.hash) {
    record.attempts += 1;
    await env.OTP_KV.put(key, JSON.stringify(record), { expirationTtl: OTP_TTL_SECONDS });
    return json({ ok: false, error: 'Invalid OTP' }, 401, corsHeaders);
  }

  await env.OTP_KV.delete(key);
  return json({ ok: true }, 200, corsHeaders);
}

function assertEnv(env) {
  const required = ['OTP_KV', 'OTP_PEPPER', 'RESEND_API_KEY', 'OTP_FROM_EMAIL', 'ALLOWED_ORIGIN'];
  const missing = required.filter(name => !env[name]);
  if (missing.length) throw new Error('Missing env: ' + missing.join(', '));
}

function buildCorsHeaders(origin, allowedOrigin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
  if (origin && origin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}

function normalizeEmail(email) {
  const value = String(email || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : '';
}

function generateOtp() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(100000 + (bytes[0] % 900000));
}

function otpKey(email) {
  return 'otp:code:' + email;
}

async function hashOtp(email, otp, pepper) {
  const data = new TextEncoder().encode(email + ':' + otp + ':' + pepper);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function sendEmail(env, email, otp) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.OTP_FROM_EMAIL,
      to: email,
      subject: 'Kod OTP Portal Direktori Pengusaha Ternakan',
      text: 'Kod OTP anda ialah ' + otp + '. Kod ini sah selama 10 minit. Jika anda tidak meminta kod ini, abaikan e-mel ini.'
    })
  });

  if (!response.ok) {
    throw new Error('Email provider failed');
  }
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
