import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  growth_monthly: 'price_1Tw9wKGe59QBxetCviy3Ikc2',
  growth_yearly: 'price_1TwA1cGe59QBxetCWe2EDDFx',
  pro_monthly: 'price_1TwA5VGe59QBxetC0BC5addd',
  pro_yearly: 'price_1TwA6mGe59QBxetCU6e9YJkI',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { action } = req.body;
  try {
    if (action === 'create_checkout') {
      const { plan, userId, userEmail, successUrl, cancelUrl } = req.body;
      const priceId = PLANS[plan];
      if (!priceId) return res.status(400).json({ error: 'Invalid plan' });
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl || 'https://www.getstockguard.com?payment=success',
        cancel_url: cancelUrl || 'https://www.getstockguard.com?payment=cancelled',
        metadata: { userId },
        subscription_data: { metadata: { userId } },
        allow_promotion_codes: true,
      });
      return res.status(200).json({ url: session.url, sessionId: session.id });
    }
    if (action === 'create_portal') {
      const { customerId, returnUrl } = req.body;
      if (!customerId) return res.status(400).json({ error: 'Missing customerId' });
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || 'https://www.getstockguard.com',
      });
      return res.status(200).json({ url: session.url });
    }
    if (action === 'get_subscription') {
      const { customerId } = req.body;
      if (!customerId) return res.status(400).json({ error: 'Missing customerId' });
      const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 });
      if (subscriptions.data.length === 0) return res.status(200).json({ active: false, plan: 'starter' });
      const sub = subscriptions.data[0];
      const priceId = sub.items.data[0].price.id;
      let plan = 'starter';
      if (priceId === PLANS.growth_monthly || priceId === PLANS.growth_yearly) plan = 'growth';
      if (priceId === PLANS.pro_monthly || priceId === PLANS.pro_yearly) plan = 'pro';
      return res.status(200).json({ active: true, plan, subscriptionId: sub.id, customerId: sub.customer, currentPeriodEnd: sub.current_period_end, cancelAtPeriodEnd: sub.cancel_at_period_end });
    }
    return res.status(400).json({ error: 'Unknown action: ' + action });
  } catch (err) {
    console.error('Stripe API error:', err);
    return res.status(500).json({ error: err.message });
  }
}