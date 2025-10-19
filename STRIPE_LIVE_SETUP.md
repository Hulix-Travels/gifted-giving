# Stripe Live Setup Instructions

## ✅ Test Data Removed
I've successfully removed the test card information section from the donation payment form. The test card details (4242 4242 4242 4242, etc.) are no longer displayed to users.

## 🔑 Stripe Live Keys Setup

### 1. Get Your Live Stripe Keys
1. Log into your Stripe Dashboard
2. Go to Developers > API Keys
3. Make sure you're in "Live mode" (toggle in top right)
4. Copy your live keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

### 2. Update Backend Configuration
Replace the placeholder values in `server/config.env`:
```env
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_LIVE_WEBHOOK_SECRET
```

### 3. Update Frontend Configuration
For local development, create a `.env.local` file in the `client` folder:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_LIVE_PUBLISHABLE_KEY
```

For production deployment (Vercel), add this environment variable in your Vercel dashboard.

### 4. Webhook Configuration
1. In Stripe Dashboard, go to Developers > Webhooks
2. Create a new webhook endpoint pointing to your production backend
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret and update your backend configuration

## 🚀 Ready for Production
Your donation system is now ready for live payments! The test card information has been removed, and you just need to replace the placeholder keys with your actual live Stripe keys.
