import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
import { formatCurrency } from "../../lib/utils";
import { Ticket, TrendingUp, Calendar, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Overview() {
  const { user } = useUser();
  const [stats, setStats] = useState({ revenue: 0, tickets: 0, activeEvents: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (!events) return;
      
      const { data: registrations } = await supabase
        .from('registrations')
        .select('amount_paid')
        .in('event_id', events.map(e => e.id));

      const totalRevenue = registrations?.reduce((sum, r) => sum + (r.amount_paid || 0), 0) || 0;

      setStats({
        revenue: totalRevenue,
        tickets: registrations?.length || 0,
        activeEvents: events.length
      });
      setRecentEvents(events); // Show all events for now
      setLoading(false);
    }
    fetchData();
  }, [user]);

  // DELETE HANDLER
  const handleDelete = async (eventId: string) => {
    if(!confirm("Are you sure? This will delete the event and tickets permanently.")) return;
    
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if(!error) {
        setRecentEvents(prev => prev.filter(e => e.id !== eventId));
        setStats(prev => ({ ...prev, activeEvents: prev.activeEvents - 1 }));
    } else {
        alert("Could not delete: " + error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-cream font-sans text-black selection:bg-orange selection:text-white">
      <DashboardNav />
      <div className="ml-64 flex-1 p-12">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-12 border-b-2 border-black pb-6">
            <div>
                <h1 className="text-6xl font-display text-orange drop-shadow-[2px_2px_0px_#222] uppercase">
                  Command Center
                </h1>
                <p className="text-xl font-body italic mt-2 opacity-80">
                  Welcome back, Ringmaster {user?.firstName}.
                </p>
            </div>
            <div className="bg-black text-cream px-4 py-1 font-accent uppercase text-sm tracking-widest rotate-2">
                Live Data
            </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#222] p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-24 h-24 text-orange" />
            </div>
            <div className="font-display text-2xl mb-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-orange rounded-full animate-pulse"></div> Total Revenue
            </div>
            <div className="text-5xl font-display text-black">{loading ? "..." : formatCurrency(stats.revenue)}</div>
          </div>
          
          <div className="bg-orange border-2 border-black shadow-[8px_8px_0px_0px_#222] p-6 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Ticket className="w-24 h-24 text-black" />
            </div>
            <div className="font-display text-2xl mb-2 text-black">Tickets Sold</div>
            <div className="text-5xl font-display text-white drop-shadow-md">{loading ? "..." : stats.tickets}</div>
          </div>
          
          <div className="bg-beige border-2 border-black shadow-[8px_8px_0px_0px_#222] p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar className="w-24 h-24 text-black" />
            </div>
            <div className="font-display text-2xl mb-2 text-black">Active Shows</div>
            <div className="text-5xl font-display text-black">{loading ? "..." : stats.activeEvents}</div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
            <span className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">!</span> 
            Your Spectacles
        </h2>
        
        <div className="grid gap-6 pb-20">
            {recentEvents.map((e) => (
                <div key={e.id} className="bg-white border-2 border-black p-6 flex items-center justify-between hover:bg-orange/5 transition-colors group">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-black text-orange flex flex-col items-center justify-center border-2 border-orange shadow-sm">
                            <span className="font-bold text-lg leading-none">{new Date(e.date).getDate()}</span>
                            <span className="text-xs uppercase">{new Date(e.date).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-display group-hover:text-orange transition-colors">{e.title}</h3>
                            <div className="text-sm font-accent uppercase tracking-widest text-black/60 flex gap-2">
                                {e.location} &bull; {e.category}
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Link to={`/dashboard/events/edit/${e.id}`}>
                             <button title="Edit" className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-transparent hover:bg-black hover:text-white hover:border-black transition-all">
                                <Pencil className="w-5 h-5" />
                            </button>
                        </Link>
                        
                        
                        
                        <Link to="/dashboard/attendees">
                            <button title="View Guests" className="bg-cream border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_#222] active:translate-y-1 active:shadow-none font-bold text-sm uppercase flex items-center gap-2">
                                Guests <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>
                </div>
            ))}
            {recentEvents.length === 0 && !loading && (
                <div className="border-2 border-dashed border-black/20 p-12 text-center text-black/40 font-accent text-xl">
                    No shows scheduled yet. Go create one!
                </div>
            )}
        </div>

      </div>
    </div>
  );
}