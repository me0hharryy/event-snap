import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
//import type{ AppEvent } from "../../lib/types";
import MarketingNav from "../../components/layout/MarketingNav";
import { MapPin, Search, ArrowRight, Filter, Flame, X, Ticket } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

const CATEGORIES = ["All", "Music", "Tech", "Business", "Art", "Social", "Sports"];

export default function Explore() {
  // Using 'any' for events temporarily to avoid TS errors if types.ts isn't updated with 'status' yet
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showTrendingOnly, setShowTrendingOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (data) setEvents(data);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const isEventTrending = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);
    return eventDate >= today && eventDate <= twoWeeksFromNow;
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
    const matchesTrending = showTrendingOnly ? isEventTrending(e.date) : true;
    return matchesSearch && matchesCategory && matchesTrending;
  });

  return (
    <div className="min-h-screen bg-cream font-sans selection:bg-orange selection:text-white flex flex-col">
      <MarketingNav />
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-black text-cream pt-32 pb-32 px-6 overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
        }}></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
            <h1 className="text-6xl md:text-8xl font-display mb-6 tracking-tight leading-none">
                Find Your <span className="text-orange">Next.</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-60 mb-12 max-w-2xl mx-auto font-light">
                Discover the most talked-about events, gigs, and workshops happening right now.
            </p>

            {/* Massive Search Bar */}
            <div className="relative group max-w-2xl mx-auto">
                <div className="absolute inset-0 bg-orange blur opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <div className="relative flex items-center bg-white rounded-full p-2 pr-4 shadow-2xl transition-transform transform group-focus-within:scale-[1.02]">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <Search className="w-5 h-5" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search events, artists, or venues..." 
                        className="w-full h-12 pl-4 bg-transparent text-black font-medium text-lg focus:outline-none placeholder:text-black/30"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="p-2 hover:bg-gray-100 rounded-full text-black/50">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- STICKY FILTER BAR --- */}
      <div className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b-2 border-black/5 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            
            {/* Trending Toggle */}
            <button
                onClick={() => setShowTrendingOnly(!showTrendingOnly)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all border-2 flex items-center gap-2 ${
                    showTrendingOnly
                    ? "bg-red-600 border-red-600 text-white shadow-md scale-105" 
                    : "bg-white border-black/10 text-red-600 hover:border-red-600 hover:bg-red-50"
                }`}
            >
                <Flame className={`w-4 h-4 ${showTrendingOnly ? 'fill-white' : 'fill-red-600'}`} /> 
                Trending
            </button>

            <div className="w-[1px] h-8 bg-black/10 mx-2 flex-shrink-0"></div>

            {/* Categories */}
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all border-2 ${
                        selectedCategory === cat 
                        ? "bg-black border-black text-white shadow-md" 
                        : "bg-white border-black/10 text-black/60 hover:text-black hover:border-black"
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        
        {/* Results Header */}
        <div className="flex justify-between items-end mb-8">
             <h2 className="text-3xl font-display">
                {selectedCategory === "All" ? "Upcoming Events" : selectedCategory}
                {showTrendingOnly && <span className="ml-3 text-red-600 text-lg">🔥 Trending Now</span>}
            </h2>
            <span className="text-sm font-bold opacity-40 uppercase tracking-widest">{filteredEvents.length} results</span>
        </div>

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
            <div className="py-24 text-center">
                <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="w-8 h-8 text-black/30" />
                </div>
                <h3 className="text-2xl font-display mb-2">No matches found.</h3>
                <p className="text-black/50 mb-8">Adjust your filters to see more events.</p>
                <button 
                    onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setShowTrendingOnly(false); }}
                    className="text-orange font-bold underline hover:text-black"
                >
                    Clear Filters
                </button>
            </div>
        )}

        {/* --- EVENT GRID --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredEvents.map(event => {
                const trending = isEventTrending(event.date);
                const isCancelled = event.status === 'cancelled';

                return (
                    <Link key={event.id} to={`/register/${event.id}`} className="group block relative">
                        {/* Card Container */}
                        <div className={`bg-white rounded-2xl border-2 border-black overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#000] flex flex-col h-full ${isCancelled ? 'grayscale opacity-80 hover:grayscale-0 hover:opacity-100' : ''}`}>
                            
                            {/* Image Wrapper */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 border-b-2 border-black">
                                {event.image_url ? (
                                    <img 
                                        src={event.image_url} 
                                        alt={event.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 text-black/20">
                                        <Ticket className="w-16 h-16 mb-2 opacity-20" />
                                        <span className="font-display text-4xl opacity-20">{event.title[0]}</span>
                                    </div>
                                )}

                                {/* Date Badge (Top Left) */}
                                <div className="absolute top-4 left-4 bg-white border-2 border-black rounded-lg px-3 py-1.5 shadow-md flex flex-col items-center leading-none min-w-[60px] z-10">
                                    <span className="text-[10px] font-bold uppercase text-red-600 tracking-widest">
                                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span className="text-2xl font-display font-black">
                                        {new Date(event.date).getDate()}
                                    </span>
                                </div>

                                {/* CANCELLED BADGE (Top Right) */}
                                {isCancelled && (
                                    <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold uppercase px-3 py-1 tracking-widest z-20 shadow-lg rotate-3 border-2 border-white">
                                        Cancelled
                                    </div>
                                )}

                                {/* Tags (Bottom Left) */}
                                <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                                     <span className="bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-white/20">
                                        {event.category || "Event"}
                                    </span>
                                    {trending && !isCancelled && (
                                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-white/20 flex items-center gap-1 shadow-lg animate-pulse">
                                            <Flame className="w-3 h-3 fill-white" /> Hot
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className={`text-2xl font-display leading-tight mb-2 line-clamp-2 transition-colors ${isCancelled ? 'text-gray-500 line-through decoration-red-500 decoration-2' : 'group-hover:text-orange'}`}>
                                    {event.title}
                                </h3>
                                
                                <div className="flex items-center gap-2 text-sm font-medium text-black/60 mb-4">
                                    <MapPin className="w-4 h-4 flex-shrink-0" /> 
                                    <span className="truncate">{event.location}</span>
                                </div>
                                
                                <div className="mt-auto pt-5 border-t border-black/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-0.5">Price</p>
                                        <p className="text-xl font-bold font-display">
                                            {event.price === 0 ? "Free" : formatCurrency(event.price)}
                                        </p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors group-hover:scale-110 ${isCancelled ? 'bg-gray-200 text-gray-400' : 'bg-black text-white group-hover:bg-orange'}`}>
                                        {isCancelled ? <X className="w-5 h-5" /> : <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
      </div>
    </div>
  );
}