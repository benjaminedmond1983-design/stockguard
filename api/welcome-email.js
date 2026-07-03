// api/welcome-email.js
// Records a signup in the `signups` table and sends a one-time welcome email
// from ben@getstockguard.com via Zoho SMTP. Called right after a successful
// signup. Idempotent: the unique(email) constraint + welcome_sent flag mean a
// given email is only ever emailed once, even if this endpoint is hit twice.

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Service-role client: server-side only, bypasses RLS so it can write to the
// locked-down signups table.
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FROM_EMAIL = 'ben@getstockguard.com';

const WELCOME_SUBJECT = 'Welcome to StockGuard — a note from Ben';

const WELCOME_BODY = `Hi,

Welcome to StockGuard, and thank you for joining us.

I'm Ben, the founder of StockGuard.

After spending years in retail management, I experienced firsthand how frustrating inventory management can be. Too many systems were complicated, expensive, or simply inaccurate. I built StockGuard to solve those problems with a tool that's simple, reliable, and designed for growing businesses.

The best place to start is by connecting your store. Whether you use Shopify, Square, or Clover, StockGuard will sync your products and inventory so you can spend less time guessing and more time making informed decisions. Setup only takes a few minutes.

As we're continuing to build and improve StockGuard, your feedback matters. If you have a question, run into an issue, or have an idea for a feature that would make your business better, just reply to this email. I personally read every message, and your input helps shape the future of StockGuard.

Thank you for trusting us to be part of your business. I'm grateful you're here, and I'm excited to help you take control of your inventory.

Blessings,

Ben Edmond
Founder, StockGuard
ben@getstockguard.com

Proverbs 16:3`;

function makeTransport() {
  return nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: FROM_EMAIL,
      pass: process.env.ZOHO_APP_PASSWORD,
    },
  });
}

export default async function handler(req, res) {
  // CORS + preflight (matches the pattern in your other api routes).
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, userId } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing email' });
  }
  const cleanEmail = email.trim().toLowerCase();

  try {
    // Record the signup. On conflict (same email), do nothing — keeps it to one
    // row per email and preserves the original welcome_sent state.
    const { error: insertError } = await supabase
      .from('signups')
      .upsert(
        { email: cleanEmail, user_id: userId || null },
        { onConflict: 'email', ignoreDuplicates: true }
      );
    if (insertError) {
      console.error('signups upsert error:', insertError.message);
    }

    // Has this email already been welcomed? If so, stop here (no double-send).
    const { data: existing, error: selectError } = await supabase
      .from('signups')
      .select('welcome_sent')
      .eq('email', cleanEmail)
      .single();
    if (selectError) {
      console.error('signups select error:', selectError.message);
      // Recorded (or attempted) but can't confirm state — don't risk a send.
      return res.status(200).json({ recorded: true, emailed: false });
    }
    if (existing && existing.welcome_sent) {
      return res.status(200).json({ recorded: true, emailed: false, reason: 'already_sent' });
    }

    // Send the welcome email.
    const transport = makeTransport();
    await transport.sendMail({
      from: `StockGuard <${FROM_EMAIL}>`,
      to: cleanEmail,
      subject: WELCOME_SUBJECT,
      text: WELCOME_BODY,
      replyTo: FROM_EMAIL,
    });

    // Mark as sent so we never email this address again.
    const { error: updateError } = await supabase
      .from('signups')
      .update({ welcome_sent: true })
      .eq('email', cleanEmail);
    if (updateError) {
      console.error('signups welcome_sent update error:', updateError.message);
    }

    return res.status(200).json({ recorded: true, emailed: true });
  } catch (err) {
    console.error('welcome-email error:', err.message);
    // 200 on purpose: a failed welcome email should never block or error the
    // user's signup flow. We log it; the row still exists for manual follow-up.
    return res.status(200).json({ recorded: true, emailed: false, error: err.message });
  }
}
