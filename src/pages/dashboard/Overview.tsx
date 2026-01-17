import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
import { formatCurrency } from "../../lib/utils";
import { Ticket, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Overview() {
  const { user } = useUser();
  const [stats, setStats] = useState({ revenue: 0, tickets: 0, activeEvents: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      // 1. Fetch Events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (!events) return;
      
      // 2. Fetch Sales
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
      setRecentEvents(events.slice(0, 3));
      setLoading(false);
    }
    fetchData();
  }, [user]);

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
          {/* Card 1 */}
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#222] p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-24 h-24 text-orange" />
            </div>
            <div className="font-display text-2xl mb-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-orange rounded-full animate-pulse"></div> Total Revenue
            </div>
            <div className="text-5xl font-display text-black">{loading ? "..." : formatCurrency(stats.revenue)}</div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-orange border-2 border-black shadow-[8px_8px_0px_0px_#222] p-6 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Ticket className="w-24 h-24 text-black" />
            </div>
            <div className="font-display text-2xl mb-2 text-black">Tickets Sold</div>
            <div className="text-5xl font-display text-white drop-shadow-md">{loading ? "..." : stats.tickets}</div>
          </div>
          
          {/* Card 3 */}
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
            Latest Spectacles
        </h2>
        
        <div className="grid gap-6">
            {recentEvents.map((e) => (
                <div key={e.id} className="bg-white border-2 border-black p-6 flex items-center justify-between hover:bg-orange/10 transition-colors">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-black text-orange flex flex-col items-center justify-center border-2 border-orange">
                            <span className="font-bold text-lg leading-none">{new Date(e.date).getDate()}</span>
                            <span className="text-xs uppercase">{new Date(e.date).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-display">{e.title}</h3>
                            <div className="text-sm font-accent uppercase tracking-widest text-black/60">{e.location}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                             <div className="text-xl font-bold">{e.price === 0 ? "FREE" : formatCurrency(e.price)}</div>
                             <div className="text-xs uppercase tracking-widest text-black/40">Price</div>
                        </div>
                        <Link to="/dashboard/attendees">
                            <button className="bg-cream border-2 border-black p-3 hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_#222] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                                <ArrowUpRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            ))}
            {recentEvents.length === 0 && (
                <div className="border-2 border-dashed border-black/20 p-12 text-center text-black/40 font-accent text-xl">
                    No shows scheduled yet. Go create one!
                </div>
            )}
        </div>

      </div>
    </div>
  );
}