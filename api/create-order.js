// This file runs on the Server (Node.js), not the browser.
// It keeps your keys secure.

import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { eventId, userId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "Missing event ID" });
  }

  try {
    // 1. Initialize Supabase (Securely)
    // We create a fresh client here to ensure we fetch the REAL price from DB
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    // 2. Fetch the Event Price from DB
    // (We do NOT trust the price sent from the frontend)
    const { data: event, error } = await supabase
      .from("events")
      .select("price, title")
      .eq("id", eventId)
      .single();

    if (error || !event) {
      throw new Error("Event not found");
    }

    // 3. Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET, // This key exists ONLY on server
    });

    // 4. Create the Order
    // Razorpay expects amount in paise (1 INR = 100 paise)
    const options = {
      amount: event.price * 100, 
      currency: "INR",
      receipt: `rcpt_${eventId.slice(0, 5)}_${Date.now()}`,
      notes: {
        eventId: eventId,
        eventTitle: event.title,
        userId: userId
      }
    };

    const order = await razorpay.orders.create(options);

    // 5. Send Order ID back to Frontend
    return res.status(200).json(order);

  } catch (err) {
    console.error("Order creation failed:", err);
    return res.status(500).json({ error: err.message });
  }
}