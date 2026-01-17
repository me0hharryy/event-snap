import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  // 1. Verify the webhook comes from Razorpay
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (generatedSignature !== signature) {
    return res.status(400).json({ status: "Invalid signature" });
  }

  // 2. Initialize Supabase Admin (Bypasses RLS)
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const event = req.body.event;
  const payload = req.body.payload;

  // 3. Handle Payment Captured
  if (event === "payment.captured") {
    const payment = payload.payment.entity;
    const orderId = payment.order_id; // The ID you generated in create-order
    const email = payment.email;

    // Update the registration status to 'paid'
    // This assumes you saved the Razorpay Order ID in your database when the user clicked 'Pay'
    const { error } = await supabase
      .from("registrations")
      .update({ payment_status: "paid", amount_paid: payment.amount / 100 })
      .eq("payment_id", orderId); // You need to store order_id as payment_id initially

    if (error) {
      console.error("DB Error:", error);
      return res.status(500).send("Database Update Failed");
    }
  }

  res.status(200).json({ status: "ok" });
}