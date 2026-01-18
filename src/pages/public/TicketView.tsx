import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../lib/supabase";
import { Loader2, MapPin, Calendar, Download, Share2, CheckCircle } from "lucide-react";
import MarketingNav from "../../components/layout/MarketingNav";
import { formatCurrency } from "../../lib/utils";

export default function TicketView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      if (!id) return;
      
      // Fetch Ticket + Event Details
      const { data, error } = await supabase
        .from('registrations')
        .select(`
            *,
            events (
                title,
                date,
                location,
                image_url,
                price
            )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
          setError(true);
      } else {
          setTicket(data);
      }
      setLoading(false);
    }
    fetchTicket();
  }, [id]);

  const handleDownload = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><Loader2 className="animate-spin w-8 h-8" /></div>;
  
  if (error || !ticket) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-center p-6">
          <h1 className="text-4xl font-display mb-4">Ticket Not Found</h1>
          <p className="mb-8 opacity-60">This ticket ID does not exist or has been removed.</p>
          <Link to="/" className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest">Go Home</Link>
      </div>
  );

  return (
    <div className="min-h-screen bg-cream font-sans print:bg-white">
      <div className="print:hidden">
        <MarketingNav />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20 print:p-0">
        
        {/* Success Banner (Hidden when printing) */}
        <div className="mb-8 text-center print:hidden animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display mb-2">You're going to {ticket.events.title}!</h1>
            <p className="opacity-60">Your ticket is confirmed. Show this QR code at the entrance.</p>
        </div>

        {/* --- TICKET CARD --- */}
        <div className="bg-white border-2 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,0.1)] print:shadow-none print:border-2 flex flex-col md:flex-row overflow-hidden max-w-3xl mx-auto relative">
            
            {/* Left Side: Event Info */}
            <div className="flex-1 p-8 md:p-10 border-b-2 md:border-b-0 md:border-r-2 border-black border-dashed relative">
                {/* Punch Holes Visuals */}
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-cream rounded-full border-2 border-black print:hidden"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-cream rounded-full border-2 border-black print:hidden"></div>
                
                <div className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">Event Ticket</div>
                <h2 className="text-4xl font-display leading-none mb-6">{ticket.events.title}</h2>
                
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange/10 flex items-center justify-center border-2 border-black rounded-full">
                            <Calendar className="w-5 h-5 text-orange" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold opacity-50">Date</p>
                            <p className="font-bold">
                                {new Date(ticket.events.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange/10 flex items-center justify-center border-2 border-black rounded-full">
                            <MapPin className="w-5 h-5 text-orange" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold opacity-50">Location</p>
                            <p className="font-bold">{ticket.events.location}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-black/5">
                    <div>
                        <p className="text-xs uppercase font-bold opacity-50">Attendee</p>
                        <p className="font-bold truncate">{ticket.attendee_name}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase font-bold opacity-50">Ticket ID</p>
                        <p className="font-mono text-xs mt-1 opacity-70 truncate" title={ticket.id}>{ticket.id.slice(0, 8)}...</p>
                    </div>
                </div>
            </div>

            {/* Right Side: QR Code */}
            <div className="bg-black text-white p-8 md:w-80 flex flex-col items-center justify-center text-center relative">
                 <div className="mb-6 p-4 bg-white rounded-xl border-4 border-orange">
                    {/* THE QR CODE GENERATOR */}
                    <QRCodeSVG 
                        value={ticket.id} // Scannable value is the Ticket ID
                        size={140}
                        level="H" // High error correction
                    />
                 </div>
                 <p className="text-xs font-mono opacity-60 mb-1">Scan to Verify</p>
                 <p className="text-xs font-bold uppercase tracking-widest text-orange">Valid for 1 Entry</p>
                 
                 <div className="mt-8 pt-6 border-t border-white/20 w-full">
                     <p className="text-xs uppercase opacity-40 mb-1">Price Paid</p>
                     <p className="text-2xl font-display">{formatCurrency(ticket.amount_paid)}</p>
                 </div>
            </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="mt-12 flex justify-center gap-4 print:hidden">
            <button onClick={handleDownload} className="flex items-center gap-2 bg-white border-2 border-black px-6 py-3 font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                <Download className="w-5 h-5" /> Download / Print
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }} className="flex items-center gap-2 bg-transparent opacity-50 hover:opacity-100 px-6 py-3 font-bold uppercase tracking-widest transition-opacity">
                <Share2 className="w-5 h-5" /> Share
            </button>
        </div>

      </div>
    </div>
  );
}