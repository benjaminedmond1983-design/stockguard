// api/stripe-webhook.js
// Stripe subscription-lifecycle webhook for StockGuard.
//
// Uses the classic Vercel Node handler (export default handler(req, res)) so the
// zero-config builder registers it as a function, same as api/stripe.js. Body
// parsing is DISABLED via the config export below so we can read the RAW request
// body — Stripe needs the exact raw bytes to verify the signature. Do NOT remove
// the config export or the readRawBody helper.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sandbox price IDs -> plan tier.
// SWAP THESE for the live price IDs when you flip Stripe to the live account.
const PRICE_TO_PLAN = {
  price_1Tg6tPGaunpstZPiVdD0kigz: 'growth', // Growth Monthly
  price_1Tg6vmGaunpstZPigriqHqpi: 'growth', // Growth Yearly
  price_1Tg6nOGaunpstZPiDR88mE57: 'pro',    // Pro Monthly
  price_1Tg6qiGaunpstZPiud7uztpX: 'pro',    // Pro Yearly
};

// Body parsing is off (see config), so req is still the raw stream and we can
// collect the exact bytes Stripe signed.
async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function planFromSubscription(subscription) {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  return PRICE_TO_PLAN[priceId] || 'starter';
}

// current_period_end is top-level on older Stripe API versions and item-level on
// newer ones — read both so this works either way.
function periodEnd(subscription) {
  return (
    subscription.current_period_end ??
    subscription.items?.data?.[0]?.current_period_end ??
    null
  );
}

async function upsertFromSubscription(subscription, fallbackUserId) {
  const userId = subscription.metadata?.userId || fallbackUserId;
  if (!userId) {
    console.error('Webhook: no userId on subscription', subscription.id);
    return;
  }
  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      plan: planFromSubscription(subscription),
      status: subscription.status,
      current_period_end: periodEnd(subscription),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (error) console.error('Webhook upsert error:', error.message);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription
          );
          await upsertFromSubscription(subscription, userId);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await upsertFromSubscription(event.data.object);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        if (userId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              plan: 'starter',
              status: 'canceled',
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
          if (error) console.error('Webhook cancel update error:', error.message);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    // 500 so Stripe retries the delivery.
    return res.status(500).send(`Handler Error: ${err.message}`);
  }

  return res.status(200).json({ received: true });
}
