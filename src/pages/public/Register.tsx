import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
//import type{ AppEvent } from "../../lib/types"; // Ensure AppEvent type has 'status' or just ignore TS warning
import MarketingNav from "../../components/layout/MarketingNav";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Calendar, MapPin, Ticket, Loader2, CheckCircle, ArrowRight, Share2, AlignLeft, Smartphone, Ban } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import confetti from "canvas-confetti";

export default function Register() {
  const { id } = useParams();
  const { user } = useUser();
  const [event, setEvent] = useState<any | null>(null); // Using 'any' to avoid TS error if types.ts isn't updated yet
  const [loading, setLoading] = useState(false);
  const [existingTicket, setExistingTicket] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "" 
  });

  // PayU Hidden Form State
  const payuFormRef = useRef<HTMLFormElement>(null);
  const [payuData, setPayuData] = useState<any>(null);

  // 1. Fetch Event & Check if User is Already Registered (On Load)
  useEffect(() => {
    async function fetchEventAndCheckRegistration() {
      if (!id) return;
      
      const { data: eventData } = await supabase.from('events').select('*').eq('id', id).single();
      
      if (eventData) {
          setEvent(eventData);
          // Optional: Alert user immediately if cancelled
          if (eventData.status === 'cancelled') {
             console.log("This event has been cancelled.");
          }
      }

      if (user?.primaryEmailAddress?.emailAddress) {
          checkExisting(user.primaryEmailAddress.emailAddress, id);
      }
    }
    fetchEventAndCheckRegistration();
  }, [id, user]);

  // Helper to check existing ticket
  async function checkExisting(email: string, eventId: string) {
      const { data } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('attendee_email', email)
        .maybeSingle();
      
      if (data) setExistingTicket(data.id);
      return data;
  }

  // 2. Auto-Submit to PayU when data is ready
  useEffect(() => {
    if (payuData && payuFormRef.current) {
        payuFormRef.current.submit();
    }
  }, [payuData]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  const handleFreeSuccess = (registrationId: string) => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FA8112', '#000000', '#FFFFFF'] });
    setTimeout(() => {
        setLoading(false); 
        window.location.href = `/tickets/${registrationId}`;
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    
    // SAFETY CHECK: Stop if cancelled
    if (event.status === 'cancelled') {
        alert("This event is cancelled. Registration is closed.");
        return;
    }

    setLoading(true);

    try {
        // --- STEP 0: DUPLICATE CHECK ---
        const duplicate = await checkExisting(formData.email, event.id);
        
        if (duplicate) {
            alert("⚠️ You already have a ticket with this email address!");
            setExistingTicket(duplicate.id); 
            setLoading(false);
            return; 
        }

        // --- SCENARIO A: FREE EVENT (No PayU) ---
        if (event.price === 0) {
            console.log("Processing free registration...");
            
            const { data, error } = await supabase.from('registrations').insert({
                event_id: event.id,
                attendee_name: formData.name,
                attendee_email: formData.email,
                phone: formData.phone,
                payment_status: 'paid',
                amount_paid: 0
            }).select().single();

            if (error) {
                if (error.code === '23505') { 
                    alert("Ticket already exists for this email.");
                    setLoading(false);
                    return;
                }
                throw error;
            } 

            if (data) {
                // Send Email (Fire and forget)
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
            }
            return; 
        }

        // --- SCENARIO B: PAID EVENT (PayU) ---
        console.log("Initializing PayU Payment...");

        const res = await fetch('/api/create-payu-hash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: event.id,
                userId: user?.id,
                userEmail: formData.email,
                userName: formData.name,
                phone: formData.phone
            })
        });

        const result = await res.json();
        
        if (result.error) throw new Error(result.error);

        setPayuData({
            ...result,
            phone: formData.phone 
        });

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
      
      {/* --- HIDDEN PAYU FORM --- */}
      {payuData && (
          <form 
            action={payuData.action} 
            method="post" 
            ref={payuFormRef} 
            className="hidden"
          >
            <input type="hidden" name="key" value={payuData.key} />
            <input type="hidden" name="txnid" value={payuData.txnid} />
            <input type="hidden" name="productinfo" value={payuData.productinfo} />
            <input type="hidden" name="amount" value={payuData.amount} />
            <input type="hidden" name="email" value={payuData.email} />
            <input type="hidden" name="firstname" value={payuData.firstname} />
            <input type="hidden" name="phone" value={payuData.phone || "9999999999"} /> 
            <input type="hidden" name="surl" value={payuData.surl} />
            <input type="hidden" name="furl" value={payuData.furl} />
            <input type="hidden" name="hash" value={payuData.hash} />
          </form>
      )}

      <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-2 gap-0 border-2 border-black shadow-[16px_16px_0px_0px_#222] animate-fade-in-up min-h-[600px]">
                
                {/* --- LEFT SIDE: EVENT DETAILS --- */}
                <div className="bg-black text-cream p-10 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 pointer-events-none">
                        <Ticket className="w-80 h-80" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <span className="inline-block bg-orange text-white px-3 py-1 font-bold uppercase text-xs tracking-widest border border-white/20">
                                {event.category || "Event"}
                            </span>
                            
                            {/* CANCELLED BADGE */}
                            {event.status === 'cancelled' && (
                                <span className="inline-block bg-red-600 text-white px-3 py-1 font-bold uppercase text-xs tracking-widest ml-2 animate-pulse">
                                    Cancelled
                                </span>
                            )}

                            <button onClick={handleShare} className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full ml-auto" title="Share Event">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-display mb-6 leading-[0.95] tracking-tight">{event.title}</h1>
                        
                        <div className="space-y-3 text-lg opacity-80 mb-8">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-orange flex-shrink-0" />
                                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-orange flex-shrink-0" />
                                {event.location}
                            </div>
                        </div>

                        <div className="flex-1 border-t border-white/10 pt-6 mb-6 overflow-hidden flex flex-col min-h-[150px]">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50 mb-3 text-orange">
                                <AlignLeft className="w-4 h-4" /> About Event
                            </div>
                            <div className="overflow-y-auto pr-2 custom-scrollbar text-white/80 leading-relaxed text-sm whitespace-pre-line font-light">
                                {event.description || "No description provided."}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/20 mt-auto">
                            <div className="text-xs uppercase tracking-widest opacity-60 mb-1">Total Amount</div>
                            <div className="text-4xl font-display text-orange">
                                {event.price === 0 ? "FREE" : formatCurrency(event.price)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDE: REGISTRATION FORM --- */}
                <div className="bg-white p-10 flex flex-col justify-center relative">
                    {existingTicket ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-600 animate-bounce-slow">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-display mb-4">You're on the list!</h2>
                            <p className="text-black/60 mb-10 text-lg">
                                You have already secured a ticket.
                            </p>
                            <Link to={`/tickets/${existingTicket}`}>
                                <Button className="w-full h-14 text-lg bg-black text-white hover:bg-orange shadow-[4px_4px_0px_0px_#000] border-none">
                                    View My Ticket <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-3xl font-display mb-8">Secure Your Spot</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block font-bold uppercase text-xs mb-2 tracking-widest opacity-60">Full Name</label>
                                    <Input 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required 
                                        disabled={event.status === 'cancelled'}
                                        className="bg-gray-50 border-gray-200 focus:border-black h-12"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-xs mb-2 tracking-widest opacity-60">Email Address</label>
                                    <Input 
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required 
                                        disabled={event.status === 'cancelled'}
                                        className="bg-gray-50 border-gray-200 focus:border-black h-12"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block font-bold uppercase text-xs mb-2 tracking-widest opacity-60">Phone Number</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input 
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            required 
                                            disabled={event.status === 'cancelled'}
                                            className="bg-gray-50 border-gray-200 focus:border-black h-12 pl-10"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    {event.status === 'cancelled' ? (
                                        // 🔴 DISABLED BUTTON (CANCELLED)
                                        <Button disabled type="button" className="w-full h-16 text-xl bg-gray-100 text-gray-500 border-2 border-gray-200 cursor-not-allowed shadow-none">
                                            <Ban className="w-5 h-5 mr-2" /> REGISTRATION CLOSED
                                        </Button>
                                    ) : (
                                        // 🟢 ACTIVE BUTTON
                                        <Button type="submit" disabled={loading} size="lg" className="w-full h-16 text-xl bg-orange text-white border-black hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_#000]">
                                            {loading ? <Loader2 className="animate-spin" /> : (event.price === 0 ? "Register for Free" : "Proceed to PayU")}
                                        </Button>
                                    )}
                                    
                                    {event.price > 0 && event.status !== 'cancelled' && (
                                        <div className="flex justify-center gap-2 mt-4 opacity-50 text-[10px] uppercase font-bold tracking-widest">
                                            <span>🔒 Secured by PayU</span>
                                            <span>•</span>
                                            <span>Cards, UPI, NetBanking</span>
                                        </div>
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