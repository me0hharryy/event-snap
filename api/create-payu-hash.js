import { createClient } from "@supabase/supabase-js";
import sha512 from "js-sha512";

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { 
        type = 'event', // Default to event
        eventId, 
        planName, 
        amount: planPrice, 
        userId, 
        userEmail, 
        userName, 
        phone 
    } = req.body;
    
    let amount = 0;
    let productinfo = "";

    // --- LOGIC: CHECK TYPE ---
    if (type === 'plan') {
        // SCENARIO A: MEMBERSHIP
        amount = parseFloat(planPrice).toFixed(2);
        // We add a prefix so we can identify it later
        productinfo = `PLAN_${planName.toUpperCase()}`; 
    } else {
        // SCENARIO B: EVENT TICKET
        const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
        const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
        if (!event) throw new Error("Event not found");
        
        amount = event.price.toFixed(2);
        productinfo = event.title;
    }

    const txnid = `tx_${Date.now()}`;
    const firstname = userName ? userName.split(' ')[0] : "User";
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;
    
    // Generate Hash
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${userEmail}|||||||||||${salt}`;
    const hash = sha512(hashString);

    res.status(200).json({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email: userEmail,
      phone: phone || "9999999999",
      surl: `${req.headers.origin}/api/payu-success`,
      furl: `${req.headers.origin}/payment/failure`,
      hash,
      action: "https://test.payu.in/_payment" // Change to secure.payu.in for live
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}