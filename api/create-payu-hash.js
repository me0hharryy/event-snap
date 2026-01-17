import { createClient } from "@supabase/supabase-js";
import sha512 from "js-sha512";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { eventId, userId, userEmail, userName } = req.body;
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

    // 1. Fetch Price
    const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
    if (!event) throw new Error("Event not found");

    // 2. Prepare Transaction Data
    const txnid = `tx_${Date.now()}`;
    const amount = event.price.toFixed(2); // PayU expects 2 decimal places
    const productinfo = event.title;
    const firstname = userName.split(' ')[0];
    const email = userEmail;
    
    // 3. Generate Hash
    // Formula: key|txnid|amount|productinfo|firstname|email|||||||||||SALT
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;
    
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = sha512(hashString);

    // 4. Return params to frontend
    res.status(200).json({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone: "9999999999", // Required by PayU (Dummy for test)
      surl: `${req.headers.origin}/api/payu-success`, // Success URL (Backend Endpoint)
      furl: `${req.headers.origin}/payment/failure`, // Failure URL
      hash,
      action: "https://test.payu.in/_payment" // Use test URL
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}