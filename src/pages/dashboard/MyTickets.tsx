import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
import { Link } from "react-router-dom";
import { Ticket, MapPin, ArrowRight } from "lucide-react";

export default function MyTickets() {
  const { user } = useUser();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyTickets() {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const { data } = await supabase
        .from('registrations')
        .select('*, events(*)') // Join with events table
        .eq('attendee_email', user.primaryEmailAddress.emailAddress)
        .order('created_at', { ascending: false });

      if (data) setTickets(data);
      setLoading(false);
    }
    fetchMyTickets();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-cream font-sans text-black selection:bg-orange selection:text-white">
      <DashboardNav />
      <div className="ml-64 flex-1 p-12">
        
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-6 flex items-end justify-between">
            <div>
                <h1 className="text-6xl font-display text-orange drop-shadow-[2px_2px_0px_#222] uppercase">
                  My Collection
                </h1>
                <p className="text-xl font-body italic mt-2 opacity-80">
                  Your upcoming shows and past memories.
                </p>
            </div>
            <div className="flex items-center gap-2 text-xl font-bold bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_#222]">
                <Ticket className="w-6 h-6 text-orange" /> {tickets.length} Tickets
            </div>
        </div>

        {loading ? (
             <div className="text-2xl font-display opacity-50">Loading your passes...</div>
        ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white border-2 border-black p-0 flex shadow-[8px_8px_0px_0px_#222] hover:-translate-y-1 transition-transform group overflow-hidden h-48">
                        
                        {/* Left Strip (Date) */}
                        <div className="bg-black text-white w-24 flex flex-col items-center justify-center p-4 text-center border-r-2 border-dashed border-white/20">
                            <span className="text-4xl font-display leading-none text-orange">
                                {new Date(ticket.events.date).getDate()}
                            </span>
                            <span className="text-xs uppercase tracking-widest opacity-80 mt-1">
                                {new Date(ticket.events.date).toLocaleString('default', { month: 'short' })}
                            </span>
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                                <span className="inline-block px-2 py-0.5 border border-black/20 text-[10px] font-bold uppercase tracking-widest mb-3 bg-gray-50">
                                    {ticket.events.category || "Event"}
                                </span>
                                <h3 className="text-2xl font-display leading-none mb-2 group-hover:text-orange transition-colors line-clamp-1">
                                    {ticket.events.title}
                                </h3>
                                <div className="text-sm text-black/60 flex items-center gap-2 line-clamp-1">
                                    <MapPin className="w-3 h-3" /> {ticket.events.location}
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center">
                                <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">
                                    #{ticket.id.slice(0, 6)}
                                </span>
                                <Link to={`/tickets/${ticket.id}`}>
                                    <button className="flex items-center gap-1 text-sm font-bold hover:text-orange transition-colors uppercase tracking-wider">
                                        View <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {tickets.length === 0 && (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-black/10 bg-white/50">
                        <h3 className="font-display text-4xl opacity-30 mb-4">No tickets found.</h3>
                        <Link to="/explore">
                            <button className="text-orange hover:text-black font-bold underline decoration-2 underline-offset-4">
                                Go explore some events
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}