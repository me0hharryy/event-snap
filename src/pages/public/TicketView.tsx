import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import QRCode from "react-qr-code";
import MarketingNav from "../../components/layout/MarketingNav";
import { Button } from "../../components/ui/Button";
import { Calendar, MapPin, Download, ArrowLeft } from "lucide-react";

// NEW IMPORT
import { toPng } from "html-to-image";

export default function TicketView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTicket() {
      const { data } = await supabase
        .from('registrations')
        .select('*, events(*)')
        .eq('id', id)
        .single();
      
      if (data) setTicket(data);
      setLoading(false);
    }
    fetchTicket();
  }, [id]);

  // UPDATED DOWNLOAD FUNCTION
  const downloadTicket = async () => {
    const element = document.getElementById('ticket-stub');
    if (!element) return;

    try {
      // Generate Image
      const dataUrl = await toPng(element, { cacheBust: true });
      
      // Create Download Link
      const link = document.createElement('a');
      link.download = `ticket-${ticket.events.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Could not generate ticket image", err);
      alert("Error generating ticket. Please try taking a screenshot instead.");
    }
  };

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center font-display text-2xl">Loading Ticket...</div>;
  if (!ticket) return <div className="min-h-screen bg-cream flex items-center justify-center font-display text-2xl">Ticket not found.</div>;

  return (
    <div className="min-h-screen bg-cream font-sans text-black pb-20">
      <MarketingNav />

      <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center">
        
        <Link to="/explore" className="mb-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
            <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        <h1 className="font-display text-5xl md:text-6xl mb-12 text-center">
            Your <span className="text-orange italic">Pass</span> is Ready.
        </h1>

        {/* TICKET STUB UI */}
        <div id="ticket-stub" className="w-full max-w-3xl bg-white border-2 border-black shadow-[16px_16px_0px_0px_#222] flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Left: Event Details */}
            <div className="flex-1 p-8 md:p-12 relative border-b-2 md:border-b-0 md:border-r-2 border-dashed border-black/20 bg-white">
                {/* Decorative Holes */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-cream rounded-full border-r-2 border-black"></div>
                
                <div className="inline-block bg-orange text-white px-3 py-1 font-bold uppercase text-xs tracking-widest mb-6 border border-black">
                   {ticket.events.category || "General Admission"}
                </div>

                <h2 className="font-display text-5xl leading-none mb-6">{ticket.events.title}</h2>
                
                <div className="space-y-4 opacity-80 text-lg font-medium">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-orange" />
                        <span>{new Date(ticket.events.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-orange" />
                        {ticket.events.location}
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t-2 border-black/5 flex justify-between items-end">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1">Attendee</div>
                        <div className="font-display text-2xl">{ticket.attendee_name}</div>
                    </div>
                </div>
            </div>

            {/* Right: QR Code */}
            <div className="md:w-80 bg-black text-cream p-10 flex flex-col items-center justify-center relative">
                 <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-cream rounded-full border-l-2 border-black"></div>
                 
                 <div className="bg-white p-4 border-2 border-white mb-6 rounded-sm">
                    <QRCode 
                        value={ticket.id} 
                        size={140} 
                        fgColor="#000000" 
                        bgColor="#FFFFFF" 
                        level="M"
                    />
                 </div>
                 <p className="font-accent text-lg text-orange uppercase tracking-widest text-center mb-1">Scan at Entry</p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex gap-4">
            <Button onClick={downloadTicket} className="bg-black text-white hover:bg-orange border-none shadow-lg px-8 h-12">
                <Download className="w-4 h-4 mr-2" /> Download Ticket
            </Button>
            <Link to="/explore">
                <Button variant="outline" className="bg-white h-12 px-8 hover:bg-black hover:text-white">Find More Events</Button>
            </Link>
        </div>

      </div>
    </div>
  );
}