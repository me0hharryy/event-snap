import { createClient } from "@supabase/supabase-js";
import sha512 from "js-sha512";
import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.redirect('/payment/failure');

  const { status, txnid, amount, productinfo, firstname, email, phone, key, hash, mihpayid } = req.body;
  const salt = process.env.PAYU_SALT;

  // 1. Verify Hash
  const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const calculatedHash = sha512(hashString);

  if (calculatedHash !== hash) return res.status(400).send("Security Error: Checksum mismatch");
  if (status !== "success") return res.redirect('/payment/failure');

  try {
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

    // --- CHECK: IS THIS A PLAN? ---
    if (productinfo.startsWith('PLAN_')) {
        // === OPTION A: HANDLE SUBSCRIPTION ===
        const planName = productinfo.replace('PLAN_', ''); // e.g. "MAESTRO"
        
        // Calculate Expiry (30 Days)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); 

        // Insert into 'subscriptions'
        const { error } = await supabase.from('subscriptions').insert({
            user_email: email, 
            plan_name: planName.toLowerCase(),
            amount_paid: amount,
            transaction_id: mihpayid,
            start_date: new Date().toISOString(),
            end_date: endDate.toISOString(),
            status: 'active'
        });

        if (error) {
            console.error("Subscription Error:", error);
            // Don't crash, just log it. The payment happened.
        }
        
        // SUCCESS: Redirect to Dashboard
        return res.redirect('/dashboard/overview?upgrade=success');

    } else {
        // === OPTION B: HANDLE EVENT TICKET ===
        const { data: event } = await supabase.from('events').select('*').eq('title', productinfo).single();
        
        if (!event) throw new Error("Event not found");

        const { data: reg, error } = await supabase.from('registrations').insert({
            event_id: event.id,
            attendee_name: firstname,
            attendee_email: email,
            phone: phone || "",
            amount_paid: amount,
            payment_status: 'paid',
            check_in_status: 'pending',
            transaction_id: mihpayid
        }).select().single();

        if (error) throw error;

        // SUCCESS: Redirect to Ticket
        return res.redirect(`/tickets/${reg.id}`);
    }

  } catch (err) {
    console.error("Success Handler Error:", err);
    return res.redirect('/payment/failure');
  }
}