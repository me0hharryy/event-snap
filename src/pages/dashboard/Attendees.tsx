import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
import { Users, Download, Search, Phone, CheckCircle, Ticket } from "lucide-react";
import type{ AppEvent } from "../../lib/types";

// Define interface locally to ensure 'phone' exists
interface Attendee {
    id: string;
    attendee_name: string;
    attendee_email: string;
    phone?: string;          // <--- ADDED THIS
    payment_status: string;
    check_in_status?: string;
    status: string;          // <--- ADDED THIS ('checked_in' etc)
    amount_paid: number;
    created_at: string;
}

export default function Attendees() {
  const { user } = useUser();
  const [myEvents, setMyEvents] = useState<AppEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Load Events
  useEffect(() => {
    async function loadEvents() {
      if (!user) return;
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('date', { ascending: true });
        
      if (data && data.length > 0) {
          setMyEvents(data);
          setSelectedEventId(data[0].id); 
      }
    }
    loadEvents();
  }, [user]);

  // 2. Load Attendees
  useEffect(() => {
    if (!selectedEventId) return;
    
    async function loadAttendees() {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });
        
      if (data) setAttendees(data);
    }
    loadAttendees();
  }, [selectedEventId]);

  // Filter
  const filteredAttendees = attendees.filter(a => 
    a.attendee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.attendee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.phone && a.phone.includes(searchTerm))
  );

  // CSV Export with Phone
  const downloadCSV = () => {
    const headers = ["Name", "Email", "Phone", "Status", "Check-In", "Amount", "Date"];
    const rows = filteredAttendees.map(a => [
        `"${a.attendee_name}"`,
        `"${a.attendee_email}"`,
        `"${a.phone || ''}"`, // <--- PHONE IN CSV
        a.payment_status,
        a.status === 'checked_in' ? 'Checked In' : 'Pending',
        a.amount_paid,
        new Date(a.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "guest_list.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-cream font-sans text-black">
      <DashboardNav />
      <div className="md:ml-64 flex-1 p-8 md:p-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
                <h1 className="text-4xl md:text-6xl font-display text-black uppercase leading-none">
                  The <span className="text-orange">Guest List</span>
                </h1>
                <p className="opacity-60 mt-2">Manage your entries and check-ins.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                <Users className="w-6 h-6 text-orange" />
                <span className="font-bold text-xl">{attendees.length} Guests</span>
            </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 h-auto md:h-[70vh]">
            
            {/* Sidebar: Event Selector */}
            <div className="md:col-span-3 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[300px] md:max-h-full">
                <h3 className="font-bold uppercase text-xs mb-4 text-black/50 tracking-widest flex items-center gap-2">
                    <Ticket className="w-4 h-4" /> Select Show
                </h3>
                {myEvents.map(e => (
                    <button 
                        key={e.id}
                        onClick={() => setSelectedEventId(e.id)}
                        className={`w-full text-left p-4 border-2 border-black transition-all relative group ${selectedEventId === e.id ? 'bg-black text-white shadow-[4px_4px_0px_0px_#FA8112] translate-x-1 -translate-y-1' : 'bg-white hover:bg-orange/10'}`}
                    >
                        <div className={`text-xs uppercase tracking-widest mb-1 ${selectedEventId === e.id ? 'text-orange' : 'text-black/50'}`}>
                            {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="font-display text-lg leading-tight line-clamp-2">{e.title}</div>
                        {selectedEventId === e.id && <div className="absolute right-3 top-3 w-2 h-2 bg-orange rounded-full animate-pulse"></div>}
                    </button>
                ))}
            </div>

            {/* Main: Ledger Table */}
            <div className="md:col-span-9 flex flex-col h-[600px] md:h-auto">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#222] flex-1 flex flex-col overflow-hidden">
                    
                    {/* Toolbar */}
                    <div className="border-b-2 border-black p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search guests or phone..." 
                                className="pl-9 pr-4 py-2 border-2 border-black/20 bg-white focus:border-black focus:outline-none w-full md:w-64 text-sm transition-all" 
                            />
                        </div>
                        <button className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:text-orange transition-colors"
                            onClick={downloadCSV}>
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>

                    {/* Table Header (UPDATED GRID: 3-4-3-2) */}
                    <div className="grid grid-cols-12 p-4 border-b-2 border-black bg-black text-white font-bold uppercase tracking-widest text-xs">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-4">Email</div>
                        <div className="col-span-3">Phone</div> {/* NEW COLUMN HEADER */}
                        <div className="col-span-2 text-right">Check-In</div>
                    </div>

                    {/* Table Body */}
                    <div className="overflow-y-auto flex-1 bg-[linear-gradient(#00000005_1px,transparent_1px)] bg-[size:100%_40px] custom-scrollbar">
                        {filteredAttendees.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-black/40 min-h-[200px]">
                                <Users className="w-12 h-12 mb-4 opacity-20" />
                                <p>No guests found.</p>
                            </div>
                        ) : (
                            filteredAttendees.map(a => (
                                <div key={a.id} className="grid grid-cols-12 p-4 border-b border-black/10 hover:bg-orange/5 font-sans text-sm md:text-base items-center group transition-colors">
                                    
                                    {/* Name */}
                                    <div className="col-span-3 font-bold truncate pr-2">
                                        {a.attendee_name}
                                    </div>
                                    
                                    {/* Email */}
                                    <div className="col-span-4 truncate text-black/80 pr-2">
                                        {a.attendee_email}
                                    </div>

                                    {/* Phone (NEW COLUMN) */}
                                    <div className="col-span-3 font-mono text-sm text-black/60 flex items-center gap-2">
                                        {a.phone ? (
                                            <>
                                                <Phone className="w-3 h-3 opacity-50" /> {a.phone}
                                            </>
                                        ) : (
                                            <span className="opacity-30">-</span>
                                        )}
                                    </div>

                                    {/* Check-In Status */}
                                    <div className="col-span-2 text-right flex justify-end">
                                        {a.status === 'checked_in' ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase border border-green-600 bg-green-100 text-green-700 rounded-full animate-pulse-slow">
                                                <CheckCircle className="w-3 h-3" /> In
                                            </span>
                                        ) : (
                                            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase border border-black/10 bg-white text-black/40 rounded-full">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}