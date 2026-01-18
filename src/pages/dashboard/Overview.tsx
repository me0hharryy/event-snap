import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { usePlan } from "../../hooks/usePlan"; // <--- IMPORT THIS
import DashboardNav from "../../components/layout/DashboardNav";
import { formatCurrency } from "../../lib/utils";
import { Ticket, TrendingUp, Calendar, ArrowUpRight, Pencil, Crown, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";

export default function Overview() {
  const { user } = useUser();
  const { isPro, planName } = usePlan(); // <--- USE HOOK
  const [stats, setStats] = useState({ revenue: 0, tickets: 0, activeEvents: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // CELEBRATION EFFECT
  useEffect(() => {
    if (searchParams.get('upgrade') === 'success') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FA8112', '#000000', '#FFFFFF']
        });
        // Clean URL
        window.history.replaceState({}, '', '/dashboard/overview');
    }
  }, [searchParams]);

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
      setRecentEvents(events);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-cream font-sans text-black selection:bg-orange selection:text-white">
      <DashboardNav />
      <div className="flex-1 p-8 md:p-12 md:ml-64">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-2 border-black pb-6 gap-4">
            <div>
                <h1 className="text-4xl md:text-6xl font-display text-orange drop-shadow-[2px_2px_0px_#222] uppercase">
                  Command Center
                </h1>
                <p className="text-xl font-body italic mt-2 opacity-80">
                  Welcome back, Ringmaster {user?.firstName}.
                </p>
            </div>

            {/* PLAN BADGE */}
            {isPro ? (
                 <div className="bg-black text-white px-6 py-2 flex items-center gap-2 border-2 border-orange shadow-[4px_4px_0px_0px_#FA8112] animate-bounce-slow">
                    <Crown className="w-5 h-5 text-orange" />
                    <div className="text-left">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange leading-none">Current Plan</p>
                        <p className="font-display text-xl leading-none">THE MAESTRO</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white text-black px-4 py-2 border-2 border-black opacity-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest">Current Plan</p>
                    <p className="font-display text-lg">Apprentice</p>
                </div>
            )}
        </div>
        
        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#222] p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="font-display text-2xl mb-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-orange rounded-full animate-pulse"></div> Total Revenue
            </div>
            <div className="text-5xl font-display text-black">{loading ? <Loader2 className="animate-spin" /> : formatCurrency(stats.revenue)}</div>
          </div>
          
          <div className="bg-orange border-2 border-black shadow-[8px_8px_0px_0px_#222] p-6 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="font-display text-2xl mb-2 text-black">Tickets Sold</div>
            <div className="text-5xl font-display text-white drop-shadow-md">{loading ? <Loader2 className="animate-spin" /> : stats.tickets}</div>
          </div>
          
          <div className="bg-beige border-2 border-black shadow-[8px_8px_0px_0px_#222] p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="font-display text-2xl mb-2 text-black">Active Shows</div>
            <div className="text-5xl font-display text-black">{loading ? <Loader2 className="animate-spin" /> : stats.activeEvents}</div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
            <span className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">!</span> 
            Your Spectacles
        </h2>
        
        <div className="grid gap-6 pb-20">
            {recentEvents.length === 0 && !loading && (
                <div className="border-2 border-dashed border-black/20 p-12 text-center text-black/40 font-accent text-xl">
                    No shows scheduled yet. Go create one!
                </div>
            )}

            {recentEvents.map((e) => (
                <div key={e.id} className="bg-white border-2 border-black p-6 flex flex-col md:flex-row items-center justify-between hover:bg-orange/5 transition-colors group gap-4">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="w-16 h-16 bg-black text-orange flex flex-col items-center justify-center border-2 border-orange shadow-sm flex-shrink-0">
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
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
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
        </div>

      </div>
    </div>
  );
}