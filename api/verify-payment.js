import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { sessionId } = req.body;

  try {
    // 1. Retrieve Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // 2. Check if registration already exists (Idempotency)
    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('transaction_id', session.payment_intent) // We store Stripe PaymentIntent ID
      .single();

    if (existing) {
      return res.status(200).json({ registrationId: existing.id });
    }

    // 3. Insert Registration to DB
    const { data: newReg, error } = await supabase.from('registrations').insert({
      event_id: session.metadata.eventId,
      attendee_name: session.metadata.attendeeName,
      attendee_email: session.metadata.attendeeEmail,
      amount_paid: session.amount_total / 100,
      payment_status: 'paid',
      transaction_id: session.payment_intent, // Store Stripe ID
    }).select().single();

    if (error) throw error;

    res.status(200).json({ registrationId: newReg.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}