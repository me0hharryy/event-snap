import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
import { Users, Download, Search } from "lucide-react";
import type{ AppEvent, Registration } from "../../lib/types";

export default function Attendees() {
  const { user } = useUser();
  const [myEvents, setMyEvents] = useState<AppEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Registration[]>([]);

  useEffect(() => {
    async function loadEvents() {
      if (!user) return;
      const { data } = await supabase.from('events').select('*').eq('organizer_id', user.id);
      if (data && data.length > 0) {
          setMyEvents(data);
          setSelectedEventId(data[0].id); // Select first by default
      }
    }
    loadEvents();
  }, [user]);

  useEffect(() => {
    if (!selectedEventId) return;
    async function loadAttendees() {
      const { data } = await supabase.from('registrations').select('*').eq('event_id', selectedEventId);
      if (data) setAttendees(data);
    }
    loadAttendees();
  }, [selectedEventId]);

  return (
    <div className="flex min-h-screen bg-cream font-sans text-black">
      <DashboardNav />
      <div className="ml-64 flex-1 p-12">
        
        <div className="flex justify-between items-end mb-12">
            <h1 className="text-6xl font-display text-black uppercase">
              The <span className="text-orange">Guest List</span>
            </h1>
            <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-orange" />
                <span className="font-accent text-xl">{attendees.length} Patrons</span>
            </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 h-[70vh]">
            
            {/* Sidebar: Event Selector (Ticket Stubs) */}
            <div className="md:col-span-3 space-y-4 overflow-y-auto pr-2">
                <h3 className="font-accent uppercase text-xs mb-4 text-black/50 tracking-widest">Select Show</h3>
                {myEvents.map(e => (
                    <button 
                        key={e.id}
                        onClick={() => setSelectedEventId(e.id)}
                        className={`w-full text-left p-4 border-2 border-black transition-all relative group ${selectedEventId === e.id ? 'bg-black text-white shadow-[4px_4px_0px_0px_#FA8112]' : 'bg-white hover:bg-orange/20'}`}
                    >
                        <div className={`text-xs uppercase tracking-widest mb-1 ${selectedEventId === e.id ? 'text-orange' : 'text-black/50'}`}>
                            {new Date(e.date).toLocaleDateString()}
                        </div>
                        <div className="font-display text-lg leading-tight">{e.title}</div>
                        {selectedEventId === e.id && <div className="absolute right-2 top-2 w-2 h-2 bg-orange rounded-full"></div>}
                    </button>
                ))}
            </div>

            {/* Main: Ledger Table */}
            <div className="md:col-span-9 flex flex-col">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#222] flex-1 flex flex-col">
                    
                    {/* Toolbar */}
                    <div className="border-b-2 border-black p-4 bg-beige flex justify-between items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/40" />
                            <input placeholder="Search names..." className="pl-9 pr-4 py-2 border-2 border-black/20 bg-white focus:border-black focus:outline-none w-64 text-sm" />
                        </div>
                        <button className="flex items-center gap-2 font-bold text-sm uppercase hover:text-orange transition-colors">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-4 p-4 border-b-2 border-black bg-black text-cream font-accent uppercase tracking-widest text-sm">
                        <div className="col-span-1">Name</div>
                        <div className="col-span-2">Email Address</div>
                        <div className="col-span-1 text-right">Status</div>
                    </div>

                    {/* Table Body */}
                    <div className="overflow-y-auto flex-1 bg-[linear-gradient(#00000005_1px,transparent_1px)] bg-[size:100%_40px]">
                        {attendees.map(a => (
                            <div key={a.id} className="grid grid-cols-4 p-4 border-b border-black/10 hover:bg-orange/5 font-sans text-lg items-center">
                                <div className="col-span-1 font-bold">{a.attendee_name}</div>
                                <div className="col-span-2 text-black/70">{a.attendee_email}</div>
                                <div className="col-span-1 text-right">
                                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase border-2 border-black ${a.payment_status === 'paid' ? 'bg-green-400 text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-yellow-400 text-black'}`}>
                                        {a.payment_status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {attendees.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-black/40">
                                <Users className="w-12 h-12 mb-4 opacity-20" />
                                <p>The hall is empty.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}