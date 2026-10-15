/* Example webhook receiver to update Supabase payment_requests table.
   Placed in supabase/ so it is close to database migrations and Supabase-related scripts.

   Instructions:
   1. Copy supabase/.env.example to supabase/.env and fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WEBHOOK_SECRET and PORT
   2. Install deps: npm install express node-fetch dotenv
   3. Run: node supabase/webhook-server.js
   4. Expose with ngrok for gateway testing: ngrok http <PORT>

   Expected webhook payload (example):
   {
     "requestId": "req_abc123",
     "status": "approved"
   }

   The gateway should send an HMAC-SHA256 signature in header x-webhook-signature as hex.
*/

const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');
require('dotenv').config({ path: __dirname + '/.env' });

const PORT = process.env.PORT || 8080;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET; // pre-shared secret to validate webhook

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !WEBHOOK_SECRET) {
  console.error('Missing required env vars. See supabase/.env.example');
  process.exit(1);
}

const app = express();

app.use((req, res, next) => {
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    req.rawBody = Buffer.concat(chunks);
    try {
      req.body = JSON.parse(req.rawBody.toString('utf8'));
    } catch (e) {
      req.body = undefined;
    }
    next();
  });
});

app.get('/', (req, res) => res.send('Supabase webhook example alive'));

app.post('/webhook/payments', async (req, res) => {
  try {
    const signature = req.header('x-webhook-signature') || req.header('x-signature') || '';
    if (!signature) return res.status(400).send({ error: 'Missing signature header' });

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(req.rawBody || '');
    const expected = hmac.digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))) {
      return res.status(401).send({ error: 'Invalid signature' });
    }

    const payload = req.body;
    if (!payload || !payload.requestId) return res.status(400).send({ error: 'Missing requestId' });

    const { requestId, status } = payload;
    const mappedStatus = (status || '').toLowerCase() === 'approved' ? 'approved' : (status || '').toLowerCase() === 'rejected' ? 'rejected' : 'pending';

    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/payment_requests?request_id=eq.${encodeURIComponent(requestId)}`;

    const getRes = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!getRes.ok) return res.status(500).send({ error: 'Could not fetch payment request' });

    const rows = await getRes.json();
    if (!Array.isArray(rows) || rows.length === 0) return res.status(404).send({ error: 'Payment request not found' });

    const existing = rows[0];
    if (existing.status === mappedStatus) return res.send({ ok: true, note: 'Already up-to-date' });

    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ status: mappedStatus }),
    });

    if (!patchRes.ok) return res.status(500).send({ error: 'Failed to update Supabase' });

    const updated = await patchRes.json();
    console.log('Updated payment request', requestId, '->', mappedStatus);

    return res.send({ ok: true, updated });
  } catch (err) {
    console.error('Webhook handler error', err);
    return res.status(500).send({ error: 'internal_error' });
  }
});

app.listen(PORT, () => console.log(`Supabase webhook example listening on port ${PORT}`));
