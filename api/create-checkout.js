import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    console.log("1. Starting Checkout Process...");

    // DEBUG: Check if keys exist (Do not log the actual keys for security)
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY in .env");
    if (!process.env.VITE_SUPABASE_URL) throw new Error("Missing VITE_SUPABASE_URL in .env");
    if (!process.env.VITE_SUPABASE_ANON_KEY) throw new Error("Missing VITE_SUPABASE_ANON_KEY in .env");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

    const { eventId, userId, userEmail, userName } = req.body;
    const origin = req.headers.origin || 'http://localhost:3000'; 

    console.log(`2. Fetching Event ID: ${eventId}`);

    // 1. Fetch Event Price from DB
    const { data: event, error: dbError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
    
    if (dbError) throw new Error(`Database Error: ${dbError.message}`);
    if (!event) throw new Error("Event not found in Database");

    console.log(`3. Event Found: ${event.title} for price ${event.price}`);

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: event.title,
            },
            unit_amount: event.price * 100, // paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment/callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/register/${eventId}`,
      metadata: {
        eventId: event.id,
        userId: userId || 'guest',
        attendeeName: userName,
        attendeeEmail: userEmail
      },
    });

    console.log("4. Stripe Session Created URL:", session.url);
    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("CRITICAL BACKEND ERROR:", err.message); // <--- LOOK FOR THIS IN TERMINAL
    res.status(500).json({ error: err.message });
  }
}