import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import type{ AppEvent } from "../../lib/types";
import MarketingNav from "../../components/layout/MarketingNav";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Calendar, MapPin, Ticket, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import confetti from "canvas-confetti";

export default function Register() {
  const { id } = useParams();
  const { user } = useUser();
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingTicket, setExistingTicket] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || ""
  });

  // 1. Fetch Event & Check if User is Already Registered
  useEffect(() => {
    async function fetchEventAndCheckRegistration() {
      if (!id) return;
      
      const { data: eventData } = await supabase.from('events').select('*').eq('id', id).single();
      if (eventData) setEvent(eventData);

      if (user?.primaryEmailAddress?.emailAddress) {
          const { data: ticketData } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', id)
            .eq('attendee_email', user.primaryEmailAddress.emailAddress)
            .maybeSingle(); 
          
          if (ticketData) setExistingTicket(ticketData.id);
      }
    }
    fetchEventAndCheckRegistration();
  }, [id, user]);

  // 2. Success Handler for Free Events
  const handleFreeSuccess = (registrationId: string) => {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FA8112', '#000000', '#FFFFFF']
    });

    setTimeout(() => {
        setLoading(false); 
        window.location.href = `/tickets/${registrationId}`;
    }, 1000);
  };

  // 3. Main Payment/Registration Handler
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setLoading(true);

    try {
        // --- SCENARIO A: FREE EVENT ---
        if (event.price === 0) {
            console.log("Processing free registration...");
            
            // A1. Save to Database
            const { data, error } = await supabase.from('registrations').insert({
                event_id: event.id,
                attendee_name: formData.name,
                attendee_email: formData.email,
                payment_status: 'paid', // Free = Paid
                amount_paid: 0
            }).select().single();

            if (error) throw error; 

            // A2. Handle Success & Email
            if (data) {
                // Trigger Email (Fire and Forget - don't await)
                fetch('/api/send-ticket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        name: formData.name,
                        eventName: event.title,
                        date: event.date,
                        location: event.location,
                        ticketId: data.id
                    })
                }).catch(err => console.error("Email failed:", err));

                handleFreeSuccess(data.id);
            } else {
                // Fail-safe: Try to find the ticket manually if insert returned nothing
                const { data: fallbackData } = await supabase
                    .from('registrations')
                    .select('id')
                    .eq('event_id', event.id)
                    .eq('attendee_email', formData.email)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                
                if (fallbackData) handleFreeSuccess(fallbackData.id);
                else throw new Error("Could not verify registration.");
            }
            return; 
        }

        // --- SCENARIO B: PAID EVENT (STRIPE) ---
        console.log("Processing paid registration...");
        const res = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: event.id,
                userId: user?.id,
                userEmail: formData.email,
                userName: formData.name
            })
        });

        const text = await res.text();
        let responseData;
        try {
            responseData = JSON.parse(text);
        } catch (e) {
            throw new Error("Server Error: API did not return JSON. Check Vercel logs.");
        }
        
        if (responseData.error) throw new Error(responseData.error);
        
        if (responseData.url) {
            window.location.href = responseData.url; // Redirect to Stripe
        } else {
            throw new Error("No payment URL returned.");
        }

    } catch (err: any) {
        console.error("Registration Error:", err);
        alert("Something went wrong: " + (err.message || "Unknown Error"));
        setLoading(false); 
    }
  };

  if (!event) return <div className="min-h-screen bg-cream flex items-center justify-center font-display text-2xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-cream font-sans text-black selection:bg-orange selection:text-white">
      <MarketingNav />
      
      <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-2 gap-0 border-2 border-black shadow-[16px_16px_0px_0px_#222] animate-fade-in-up">
                
                {/* Left Side: Event Info */}
                <div className="bg-black text-cream p-12 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <Ticket className="w-80 h-80" />
                    </div>
                    <div className="relative z-10">
                        <span className="inline-block bg-orange text-white px-3 py-1 font-bold uppercase text-xs tracking-widest mb-6 border border-white/20">
                            {event.category || "Event"}
                        </span>
                        <h1 className="text-5xl font-display mb-6 leading-[0.95]">{event.title}</h1>
                        <div className="space-y-4 text-lg opacity-80">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-orange" />
                                {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-orange" />
                                {event.location}
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-white/20 relative z-10">
                        <div className="text-xs uppercase tracking-widest opacity-60 mb-1">Total Amount</div>
                        <div className="text-5xl font-display text-orange">
                            {event.price === 0 ? "FREE" : formatCurrency(event.price)}
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="bg-white p-12 flex flex-col justify-center relative">
                    
                    {existingTicket ? (
                        // Case: Already Registered
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-600 animate-bounce-slow">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-display mb-4">You're on the list!</h2>
                            <p className="text-black/60 mb-10 text-lg leading-relaxed">
                                You have already secured a ticket.
                            </p>
                            <Link to={`/tickets/${existingTicket}`}>
                                <Button className="w-full h-16 text-xl bg-black text-white hover:bg-orange shadow-[4px_4px_0px_0px_#000] border-none">
                                    View My Ticket <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        // Case: New Registration
                        <>
                            <h2 className="text-4xl font-display mb-8">Secure Your Spot</h2>
                            <form onSubmit={handlePayment} className="space-y-6">
                                <div>
                                    <label className="block font-bold uppercase text-xs mb-2 tracking-widest opacity-60">Full Name</label>
                                    <Input 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required 
                                        className="bg-gray-50 border-gray-200 focus:border-black"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-xs mb-2 tracking-widest opacity-60">Email Address</label>
                                    <Input 
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required 
                                        className="bg-gray-50 border-gray-200 focus:border-black"
                                    />
                                </div>
                                <div className="pt-6">
                                    <Button type="submit" disabled={loading} size="lg" className="w-full h-16 text-xl bg-orange text-white border-black hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_#000]">
                                        {loading ? <Loader2 className="animate-spin" /> : (event.price === 0 ? "Register for Free" : "Proceed to Payment")}
                                    </Button>
                                    {event.price > 0 && (
                                        <p className="text-xs text-center mt-4 opacity-50 font-medium">
                                            Processed securely by Stripe.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
      </div>
    </div>
  );
}