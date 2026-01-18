import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from "../../lib/supabase";
import { useUser } from "@clerk/clerk-react";
import DashboardNav from "../../components/layout/DashboardNav";
import { CheckCircle, XCircle, Loader2, RefreshCcw, Camera, ShieldAlert } from "lucide-react";

export default function ScannerPage() {
  const { user } = useUser();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'used' | 'unauthorized'>('idle');
  const [ticketDetails, setTicketDetails] = useState<any>(null);

  const handleScan = async (result: any) => {
    if (result && result[0]?.rawValue && status === 'idle') {
      const ticketId = result[0].rawValue;
      setScanResult(ticketId);
      validateTicket(ticketId);
      console.log(scanResult);
    }
  };

  const validateTicket = async (ticketId: string) => {
    setStatus('loading');
    
    // 1. Fetch Ticket AND Event details (specifically organizer_id)
    const { data: ticket, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events (
            title,
            organizer_id
        )
      `)
      .eq('id', ticketId)
      .single();

    if (error || !ticket) {
      setStatus('error');
      return;
    }

    // 2. SECURITY CHECK: Is the current logged-in user the organizer?
    if (ticket.events.organizer_id !== user?.id) {
        setTicketDetails(ticket); // Keep details to show what event it belongs to
        setStatus('unauthorized');
        return;
    }

    // 3. DUPLICATE CHECK: Is it already used?
    if (ticket.check_in_status === 'checked_in') {
      setTicketDetails(ticket);
      setStatus('used');
      return;
    }

    // 4. MARK AS CHECKED IN
    const { error: updateError } = await supabase
      .from('registrations')
      .update({check_in_status: 'checked_in', 
          updated_at: new Date().toISOString()})
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

        {/* --- SCENARIO 1: IDLE (CAMERA OPEN) --- */}
        {status === 'idle' && (
            <div className="w-full max-w-sm border-4 border-white/20 rounded-3xl overflow-hidden relative shadow-2xl bg-black">
                <Scanner 
                    onScan={handleScan} 
                    components={{  finder: false }}
                    constraints={{ facingMode: "environment" }}
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

        {/* --- SCENARIO 2: LOADING --- */}
        {status === 'loading' && (
            <div className="text-center animate-pulse">
                <Loader2 className="w-20 h-20 text-orange animate-spin mx-auto mb-6" />
                <h2 className="text-3xl font-display">Verifying...</h2>
            </div>
        )}

        {/* --- SCENARIO 3: SUCCESS (VALID TICKET) --- */}
        {status === 'success' && ticketDetails && (
            <div className="bg-green-500 text-black p-8 rounded-3xl text-center max-w-sm w-full animate-fade-in-up shadow-[0px_0px_50px_rgba(34,197,94,0.4)]">
                <div className="bg-black/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-display mb-2">Valid Ticket</h2>
                <div className="bg-white/20 p-4 rounded-xl mb-6 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Guest</p>
                    <p className="text-2xl font-bold leading-none mb-3">{ticketDetails.attendee_name}</p>
                    <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Event</p>
                    <p className="text-sm font-bold">{ticketDetails.events.title}</p>
                </div>
                <button onClick={resetScanner} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> Scan Next
                </button>
            </div>
        )}

        {/* --- SCENARIO 4: ALREADY USED --- */}
        {status === 'used' && ticketDetails && (
            <div className="bg-yellow-400 text-black p-8 rounded-3xl text-center max-w-sm w-full animate-shake shadow-[0px_0px_50px_rgba(250,204,21,0.4)]">
                <div className="bg-black/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-3xl font-display mb-2">Already Used</h2>
                <p className="mb-6 font-bold opacity-80 text-sm">
                    Checked in at: {new Date(ticketDetails.updated_at || Date.now()).toLocaleTimeString()}
                </p>
                
                <div className="bg-white/40 p-4 rounded-xl mb-6">
                    <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Guest Name</p>
                    <p className="text-2xl font-bold">{ticketDetails.attendee_name}</p>
                </div>

                <button onClick={resetScanner} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                    Scan Next
                </button>
            </div>
        )}

        {/* --- SCENARIO 5: UNAUTHORIZED (WRONG ORGANIZER) --- */}
        {status === 'unauthorized' && (
             <div className="bg-gray-800 text-white p-8 rounded-3xl text-center max-w-sm w-full border-2 border-red-500">
                <ShieldAlert className="w-24 h-24 mx-auto mb-4 text-red-500" />
                <h2 className="text-2xl font-display mb-2 text-red-500">Access Denied</h2>
                <p className="mb-6 opacity-70 text-sm">
                    You are not the organizer of this event. You cannot scan this ticket.
                </p>
                {ticketDetails && (
                    <div className="bg-black/50 p-3 rounded mb-6 text-xs text-left">
                        <span className="block opacity-50">Ticket belongs to:</span>
                        <span className="font-bold text-white">{ticketDetails.events.title}</span>
                    </div>
                )}
                <button onClick={resetScanner} className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">
                    Close
                </button>
            </div>
        )}

        {/* --- SCENARIO 6: INVALID/ERROR --- */}
        {status === 'error' && (
             <div className="bg-red-600 text-white p-8 rounded-3xl text-center max-w-sm w-full animate-shake">
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