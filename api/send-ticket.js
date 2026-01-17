import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { email, name, eventName, ticketId, date, location } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      // IMPORTANT: Use your VERIFIED subdomain here
      from: 'EventSnap <tickets@eventsnap.hharryy.com>', 
      to: [email],
      subject: `Your Ticket for ${eventName}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>You're going to ${eventName}!</h1>
          <p>Hi ${name},</p>
          <p>Your spot is confirmed. Here are the details:</p>
          <ul>
            <li><strong>Event:</strong> ${eventName}</li>
            <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            <li><strong>Location:</strong> ${location}</li>
          </ul>
          <p>
            <a href="https://eventsnap.hharryy.com/tickets/${ticketId}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              View Your Ticket
            </a>
          </p>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Ticket ID: ${ticketId}
          </p>
        </div>
      `,
    });

    if (error) throw error;
    res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: err.message });
  }
}