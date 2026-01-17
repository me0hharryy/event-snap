import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import type{ AppEvent } from "../../lib/types";
import MarketingNav from "../../components/layout/MarketingNav";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Calendar, MapPin, Ticket, CheckCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import confetti from "canvas-confetti";

export default function Register() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || ""
  });

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      const { data } = await supabase.from('events').select('*').eq('id', id).single();
      if (data) setEvent(data);
    }
    fetchEvent();
  }, [id]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setLoading(true);

    // 1. FREE EVENT FLOW
    if (event.price === 0) {
        const { error } = await supabase.from('registrations').insert({
            event_id: event.id,
            attendee_name: formData.name,
            attendee_email: formData.email,
            payment_status: 'paid', // Free = Paid
            amount_paid: 0
        });

        if (!error) {
            triggerSuccess();
        } else {
            alert("Registration failed: " + error.message);
            setLoading(false);
        }
        return;
    }

    // 2. PAID EVENT FLOW (Razorpay)
    try {
        // A. Create Order on Server
        const res = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: event.price })
        });
        const order = await res.json();

        if (!order.id) throw new Error("Failed to create order");

        // B. Open Razorpay
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: "INR",
            name: "EventSnap",
            description: `Ticket for ${event.title}`,
            order_id: order.id,
            handler: async function (response: any) {
                // C. On Success -> Save to DB
                const { error } = await supabase.from('registrations').insert({
                    event_id: event.id,
                    attendee_name: formData.name,
                    attendee_email: formData.email,
                    payment_status: 'paid',
                    amount_paid: event.price,
                    // Store payment_id if you added that column, otherwise ignore
                });

                if (!error) triggerSuccess();
                else alert("Payment successful but registration failed in DB. Contact support.");
            },
            prefill: {
                name: formData.name,
                email: formData.email
            },
            theme: { color: "#FA8112" }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false); // Modal is open, stop loading spinner
    } catch (err: any) {
        alert("Payment Error: " + err.message);
        setLoading(false);
    }
  };

  const triggerSuccess = () => {
      setSuccess(true);
      setLoading(false);
      confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FA8112', '#222222', '#F5E7C6']
      });
  };

  if (!event) return <div className="min-h-screen bg-cream flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-cream font-sans text-black">
      <MarketingNav />
      
      <div className="max-w-4xl mx-auto px-6 py-20">
        
        {success ? (
            // SUCCESS STATE
            <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#222] p-12 text-center">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h1 className="text-5xl font-display text-black mb-4">You're In!</h1>
                <p className="text-xl font-body mb-8">Your ticket for <span className="font-bold">{event.title}</span> has been confirmed.</p>
                <div className="bg-beige border-2 border-dashed border-black p-6 max-w-md mx-auto mb-8">
                    <div className="text-sm font-bold uppercase tracking-widest text-black/50 mb-2">Ticket Holder</div>
                    <div className="text-2xl font-display">{formData.name}</div>
                </div>
                <Button onClick={() => navigate('/explore')}>Discover More Events</Button>
            </div>
        ) : (
            // REGISTRATION FORM
            <div className="grid md:grid-cols-2 gap-0 border-2 border-black shadow-[12px_12px_0px_0px_#222]">
                
                {/* Left: Event Details (The Ticket Stub) */}
                <div className="bg-black text-cream p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Ticket className="w-64 h-64" />
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-auto">
                            <span className="inline-block bg-orange text-white px-3 py-1 font-bold uppercase text-xs tracking-widest mb-4 border border-cream/20">
                                {event.category || "Event"}
                            </span>
                            <h1 className="text-5xl font-display mb-6 leading-tight">{event.title}</h1>
                            <div className="space-y-4 text-lg opacity-90">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-orange" />
                                    {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-orange" />
                                    {event.location}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-cream/20">
                            <div className="text-sm uppercase tracking-widest opacity-60 mb-1">Total Amount</div>
                            <div className="text-5xl font-display text-orange">
                                {event.price === 0 ? "FREE" : formatCurrency(event.price)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: The Form */}
                <div className="bg-white p-10 flex flex-col justify-center">
                    <h2 className="text-3xl font-display mb-8">Secure Your Spot</h2>
                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block font-bold uppercase text-xs mb-2 tracking-widest">Full Name</label>
                            <Input 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required 
                                placeholder="Harry Houdini" 
                            />
                        </div>
                        <div>
                            <label className="block font-bold uppercase text-xs mb-2 tracking-widest">Email Address</label>
                            <Input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required 
                                placeholder="harry@magic.com" 
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={loading} size="lg" className="w-full text-xl py-8">
                                {loading ? <Loader2 className="animate-spin" /> : (event.price === 0 ? "Register for Free" : "Proceed to Payment")}
                            </Button>
                            <p className="text-xs text-center mt-4 opacity-50">
                                Secure payment powered by Razorpay.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}