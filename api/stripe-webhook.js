// api/stripe-webhook.js
// Stripe subscription-lifecycle webhook for StockGuard.
//
// IMPORTANT: This uses Vercel's Web-style handler (export async function POST)
// so we can read the RAW request body via request.text(). Stripe needs the raw
// body to verify the signature. The Node (req, res) + bodyParser:false approach
// does NOT work on non-Next Vercel functions, so do not "convert" this file to
// match the handler shape in api/stripe.js. It is different on purpose.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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

function planFromSubscription(subscription) {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  return PRICE_TO_PLAN[priceId] || 'starter';
}

// current_period_end lives at the top level on older Stripe API versions and at
// the item level on newer ones — read both so this works either way.
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

export async function POST(request) {
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
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
    // Return 500 so Stripe retries the delivery.
    return new Response(`Handler Error: ${err.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
