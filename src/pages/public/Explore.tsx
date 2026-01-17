import MarketingNav from "../../components/layout/MarketingNav";
import { useEvents } from "../../hooks/useEvents";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { MapPin, ArrowUpRight, Search, RefreshCw, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Explore() {
  const { events, loading, error, refetch } = useEvents(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Filter Logic
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || e.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-cream min-h-screen font-sans text-black">
      <MarketingNav />
      
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b-2 border-black pb-8">
          <div>
            <h1 className="font-display text-6xl md:text-8xl text-black mb-2 drop-shadow-[3px_3px_0px_#222]">
              The <span className="text-orange italic font-body">Calendar</span>
            </h1>
            <p className="font-sans text-xl text-black/60 max-w-xl">
              Curated gatherings for the curious mind.
            </p>
          </div>
          <div className="hidden md:block pb-2">
             <span className="font-accent uppercase tracking-widest text-sm text-black/40 border-2 border-black/10 px-3 py-1 bg-white">
               {events.length} Upcoming Events
             </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                <Input 
                    placeholder="Search events, cities..." 
                    className="pl-12 h-14 bg-white border-2 border-black text-lg shadow-[4px_4px_0px_0px_#222] focus:shadow-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <select 
                className="h-14 px-6 bg-white border-2 border-black font-accent uppercase text-sm focus:outline-none shadow-[4px_4px_0px_0px_#222] focus:shadow-none transition-all cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="All">All Categories</option>
                <option value="Music">Music</option>
                <option value="Tech">Tech</option>
                <option value="Workshop">Workshop</option>
                <option value="Business">Business</option>
                <option value="Art">Art</option>
            </select>
        </div>
        
        {/* State Handling: Loading, Error, or Data */}
        {loading ? (
          <div className="animate-pulse space-y-8">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-black/5 w-full border-2 border-black/5"></div>)}
          </div>
        ) : error ? (
            <div className="text-center py-20 border-2 border-dashed border-red-500 bg-red-50">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-display text-red-600 mb-2">Connection Issue</h3>
                <p className="text-black/60 mb-6">{error}</p>
                <Button onClick={refetch} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
                </Button>
            </div>
        ) : (
          <div className="flex flex-col space-y-8">
            {filteredEvents.map((e) => (
              <div 
                key={e.id} 
                className="group relative bg-white border-2 border-black p-6 flex flex-col md:flex-row gap-8 transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#FA8112]"
              >
                {/* Date Stamp */}
                <div className="md:w-32 flex flex-col items-center justify-center border-2 border-black bg-beige p-4 text-center">
                  <span className="font-accent text-xs text-black/60 tracking-widest uppercase mb-1">
                    {new Date(e.date).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="font-display text-5xl text-black leading-none">
                    {new Date(e.date).getDate().toString().padStart(2, '0')}
                  </span>
                  <span className="font-sans text-xs text-black/40 mt-1">
                    {new Date(e.date).getFullYear()}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="font-accent text-orange text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange rounded-full"></span>
                        {e.category || "General"}
                    </div>
                    <h3 className="font-display text-4xl text-black mb-3 group-hover:text-orange transition-colors">
                        {e.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-6 text-black/60 font-sans text-lg">
                        <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {e.location}
                        </span>
                        <span className="hidden md:inline text-black/20">|</span>
                        <span>
                            {new Date(e.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>

                {/* Action Area */}
                <div className="md:w-48 flex flex-col justify-between items-end border-l-2 border-dashed border-black/10 pl-6">
                   <div className="text-right">
                        <span className="block font-accent text-xs text-black/40 uppercase tracking-widest mb-1">Ticket</span>
                        <span className="font-display text-3xl text-black">
                            {e.price === 0 ? "Free" : formatCurrency(e.price)}
                        </span>
                    </div>
                    
                    <Link to={`/register/${e.id}`} className="w-full">
                        <Button className="w-full mt-4 bg-black text-white hover:bg-orange hover:text-white border-none shadow-none group-hover:shadow-[4px_4px_0px_0px_#222]">
                            Get Ticket <ArrowUpRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-black/20">
                    <h3 className="font-display text-3xl text-black/40 mb-4">No events found</h3>
                    <p className="text-black/40 mb-6">Try adjusting your search or category.</p>
                    <Button onClick={refetch} variant="outline" className="border-black/20 text-black/40 hover:border-black hover:text-black">
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh List
                    </Button>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}