import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
import { CheckCircle, XCircle, Loader2, RefreshCcw, Camera } from "lucide-react";

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'used'>('idle');
  const [ticketDetails, setTicketDetails] = useState<any>(null);

  const handleScan = async (result: any) => {
    if (result && result[0]?.rawValue && status === 'idle') {
      const ticketId = result[0].rawValue;
      setScanResult(ticketId);
      validateTicket(ticketId);
    }
  };

  const validateTicket = async (ticketId: string) => {
    setStatus('loading');
    
    // 1. Fetch Ticket
    const { data: ticket, error } = await supabase
      .from('registrations')
      .select('*, events(title)')
      .eq('id', ticketId)
      .single();

    if (error || !ticket) {
      setStatus('error');
      return;
    }

    // 2. Check if already used
    if (ticket.payment_status === 'checked_in') {
      setTicketDetails(ticket);
      setStatus('used');
      return;
    }

    // 3. Mark as Checked In
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ payment_status: 'checked_in' }) // You might want a separate 'status' column later
      .eq('id', ticketId);

    if (updateError) {
      setStatus('error');
    } else {
      setTicketDetails(ticket);
      setStatus('success');
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setStatus('idle');
    setTicketDetails(null);
  };

  return (
    <div className="flex min-h-screen bg-black font-sans text-cream">
      {/* Hide Sidebar on mobile, show on desktop */}
      <div className="hidden md:block">
        <DashboardNav />
      </div>

      <div className="md:ml-64 flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* HEADER */}
        <div className="absolute top-6 left-6 z-10">
            <h1 className="text-2xl font-display text-orange flex items-center gap-2">
                <Camera className="w-6 h-6" /> Gatekeeper
            </h1>
        </div>

        {/* SCANNER VIEW */}
        {status === 'idle' && (
            <div className="w-full max-w-sm border-4 border-white/20 rounded-3xl overflow-hidden relative shadow-2xl">
                <Scanner 
                    onScan={handleScan} 
                    components={{ audio: false, finder: false }}
                    styles={{ container: { width: '100%', height: '400px' } }}
                />
                
                {/* Overlay UI */}
                <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-orange/80 rounded-lg animate-pulse"></div>
                </div>
                <div className="absolute bottom-6 left-0 w-full text-center">
                    <p className="bg-black/60 text-white inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest backdrop-blur-md">
                        Align QR Code
                    </p>
                </div>
            </div>
        )}

        {/* LOADING STATE */}
        {status === 'loading' && (
            <div className="text-center animate-pulse">
                <Loader2 className="w-20 h-20 text-orange animate-spin mx-auto mb-6" />
                <h2 className="text-3xl font-display">Verifying...</h2>
            </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && ticketDetails && (
            <div className="bg-green-500 text-black p-8 rounded-3xl text-center max-w-sm w-full animate-fade-in-up">
                <CheckCircle className="w-24 h-24 mx-auto mb-4 drop-shadow-md" />
                <h2 className="text-4xl font-display mb-2">Valid Ticket</h2>
                <div className="bg-black/10 p-4 rounded-xl mb-6">
                    <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Guest</p>
                    <p className="text-2xl font-bold">{ticketDetails.attendee_name}</p>
                    <p className="text-sm opacity-80 mt-2">{ticketDetails.events.title}</p>
                </div>
                <button onClick={resetScanner} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> Scan Next
                </button>
            </div>
        )}

        {/* ALREADY USED STATE */}
        {status === 'used' && ticketDetails && (
            <div className="bg-yellow-400 text-black p-8 rounded-3xl text-center max-w-sm w-full animate-shake">
                <XCircle className="w-24 h-24 mx-auto mb-4" />
                <h2 className="text-3xl font-display mb-2">Already Used</h2>
                <p className="mb-6 font-bold opacity-80">This ticket was scanned previously.</p>
                
                <div className="bg-black/10 p-4 rounded-xl mb-6">
                    <p className="text-2xl font-bold">{ticketDetails.attendee_name}</p>
                </div>

                <button onClick={resetScanner} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                    Scan Next
                </button>
            </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
             <div className="bg-red-600 text-white p-8 rounded-3xl text-center max-w-sm w-full">
                <XCircle className="w-24 h-24 mx-auto mb-4" />
                <h2 className="text-4xl font-display mb-4">Invalid Ticket</h2>
                <p className="mb-8 opacity-80">We could not find this ticket in the database.</p>
                <button onClick={resetScanner} className="w-full bg-white text-red-600 py-4 rounded-xl font-bold uppercase tracking-widest">
                    Try Again
                </button>
            </div>
        )}

      </div>
    </div>
  );
}