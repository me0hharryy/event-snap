import { createClient } from "@supabase/supabase-js";
import sha512 from "js-sha512";
import { Resend } from "resend";

export default async function handler(req, res) {
  // PayU sends data via POST. If it's a GET, redirect to failure.
  if (req.method !== "POST") return res.redirect('/payment/failure');

  const { status, txnid, amount, productinfo, firstname, email, key, hash, mihpayid } = req.body;
  const salt = process.env.PAYU_SALT;

  // 1. Verify Security Hash (Crucial Step)
  // Formula: SALT|status|||||||||||email|firstname|productinfo|amount|txnid|key
  const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const calculatedHash = sha512(hashString);

  if (calculatedHash !== hash) {
    console.error("Security Error: Hash mismatch");
    return res.status(400).send("Security Error: Checksum mismatch");
  }

  if (status !== "success") {
    return res.redirect('/payment/failure');
  }

  try {
    // 2. Initialize Supabase
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

    // 3. Find the Event
    // Note: In a production app, pass the ID in 'udf1' to avoid name collisions. 
    // For now, title matching works for unique titles.
    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('title', productinfo)
        .single();

    if (!event) throw new Error("Event not found");

    // 4. Save Registration to Database
    const { data: registration, error } = await supabase.from('registrations').insert({
        event_id: event.id,
        attendee_name: firstname,
        attendee_email: email,
        phone: phone,
        amount_paid: amount,
        payment_status: 'paid',
        transaction_id: mihpayid // Save PayU's ID for reference
    }).select().single();

    if (error) throw error;

    // 5. Send Confirmation Email via Resend
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
            // UPDATE THIS: Use your verified domain here
            from: 'EventSnap <tickets@eventsnap.hharryy.com>', 
            to: email,
            subject: `Your Ticket for ${event.title} is Ready! 🎟️`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #FA8112; font-size: 24px;">You're going to ${event.title}!</h1>
                <p>Hi ${firstname},</p>
                <p>We received your payment of <strong>₹${amount}</strong>. Your spot is secured.</p>
                
                <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding-bottom: 10px;">
                                <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase;">Location</p>
                                <p style="margin: 0; font-weight: bold; font-size: 16px;">${event.location}</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase;">Date</p>
                                <p style="margin: 0; font-weight: bold; font-size: 16px;">
                                    ${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>

                <p>Please present the QR code on the page below at the venue entrance:</p>
                
                <a href="eventsnap.hharryy.com/tickets/${registration.id}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                    View Digital Ticket
                </a>
                
                <p style="margin-top: 30px; font-size: 12px; color: #aaa;">
                    Transaction ID: ${mihpayid}
                </p>
              </div>
            `
        });
        console.log(`Email sent to ${email}`);
    } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Do not crash the request if email fails; the ticket is already saved.
    }

    // 6. Redirect User to Ticket Page
    return res.redirect(`/tickets/${registration.id}`);

  } catch (err) {
    console.error("Success Handler Error:", err);
    return res.redirect('/payment/failure');
  }
}