Supabase webhook example

This directory contains a small Node/Express example to receive payment gateway webhooks and update the corresponding payment request record in Supabase.

Files:
- webhook-server.js: Example Express server that validates HMAC-SHA256 signature (x-webhook-signature), reads payload with { requestId, status }, and updates the payment_requests table via Supabase REST API using the service_role key.
- .env.example: template environment file

Quick start (local testing):
1. Copy file: cp supabase/.env.example supabase/.env and fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WEBHOOK_SECRET.
2. Install dependencies in project root or in a dedicated folder: npm install express node-fetch dotenv
3. Run: node supabase/webhook-server.js
4. Expose the server with ngrok: ngrok http 8080 (or the configured PORT) and register the ngrok URL as the webhook target in your payment provider dashboard.

Security notes:
- Use the provider's recommended signature header and verification method. The example assumes an HMAC-SHA256 hex signature in header x-webhook-signature.
- Use the Supabase service role key only on a secure server (never in client mobile app). It has elevated privileges.
- In production use HTTPS and additional logging/monitoring.

Integration:
- The server updates the `payment_requests` row where `request_id` equals the provider `requestId`. Ensure your app stores the `requestId` in that field when creating a payment request.
- The mobile app can subscribe to Supabase Realtime or poll the `payment_requests` table to detect status changes and enable the WhatsApp button when status = 'approved'.
