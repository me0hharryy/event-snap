import { useState, useEffect } from "react"; // <--- Added useEffect
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { usePlan } from "../../hooks/usePlan"; // <--- Added Hook
import DashboardNav from "../../components/layout/DashboardNav";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { MapPin, Image as ImageIcon, Ticket, Calendar, Type, Crown } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- Leaflet Icon Fix ---
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --- Map Component ---
function LocationMarker({ setLocation }: { setLocation: (loc: string) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
            setLocation(data.display_name?.split(',')[0] + ", " + (data.address?.city || data.address?.state || ""));
        });
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function CreateEvent() {
  const { register, handleSubmit, setValue } = useForm();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- LIMIT LOGIC START ---
  const { isPro, maxEvents, loading: planLoading } = usePlan();
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    async function countEvents() {
        const { count } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('organizer_id', user.id)
            .neq('status', 'cancelled'); // Don't count cancelled events
        
        setEventCount(count || 0);
    }
    countEvents();
  }, [user]);
  // --- LIMIT LOGIC END ---

  const onSubmit = async (data: any) => {
    if (!user) return;

    // 1. CHECK LIMIT BEFORE CREATING
    if (!planLoading && eventCount >= maxEvents) {
        if(window.confirm(`🔒 LIMIT REACHED\n\nYou are on the Starter Plan (Max 1 Event).\nYou already have ${eventCount} active event.\n\nUpgrade to Pro for unlimited events?`)) {
            navigate("/pricing");
        }
        return; // Stop execution
    }

    setLoading(true);

    const { error } = await supabase.from('events').insert({
      organizer_id: user.id,
      title: data.title,
      description: data.description,
      image_url: data.image_url,
      category: data.category,
      date: data.date,
      location: data.location,
      price: data.price,
      is_published: true
    });

    setLoading(false);
    if (!error) navigate('/dashboard/overview');
    else alert(error.message);
  };

  return (
    <div className="flex min-h-screen bg-cream font-sans text-black selection:bg-orange selection:text-white">
      <DashboardNav />
      
      <div className="ml-64 flex-1 p-12">
        <div className="max-w-4xl mx-auto">
            
            {/* Header with Limit Badge */}
            <div className="mb-12 text-center relative">
                <h2 className="text-6xl font-display text-orange drop-shadow-[3px_3px_0px_#222] uppercase tracking-wide">
                    Host a Spectacle
                </h2>
                <div className="flex justify-center gap-4 mt-4 items-center">
                    <p className="text-xl font-body italic opacity-80">
                        "Step right up and announce your grand event!"
                    </p>
                    {/* Visual Counter */}
                    {!planLoading && (
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border border-black ${eventCount >= maxEvents ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                            Used: {eventCount} / {isPro ? '∞' : maxEvents}
                        </span>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
                {/* Section 1: The Details (Card Style) */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#222] p-8 relative">
                    <div className="absolute -top-4 -left-4 bg-orange text-white px-4 py-1 border-2 border-black font-display tracking-widest text-sm shadow-sm rotate-[-2deg]">
                        Act I: The Basics
                    </div>

                    <div className="grid gap-6">
                        <div>
                            <label className="flex items-center gap-2 font-display text-xl mb-2">
                                <Type className="w-5 h-5 text-orange" /> Event Title
                            </label>
                            <Input {...register("title")} required placeholder="e.g. The Midnight Carnival" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 font-display text-xl mb-2">
                                    <Ticket className="w-5 h-5 text-orange" /> Category
                                </label>
                                <select {...register("category")} className="w-full h-12 border-2 border-black px-4 bg-cream text-lg font-sans focus:outline-none focus:shadow-[4px_4px_0px_0px_#FA8112] transition-all">
                                    <option value="Music">Music & Concerts</option>
                                    <option value="Tech">Technology & Code</option>
                                    <option value="Art">Art & Theatre</option>
                                    <option value="Workshop">Workshop</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 font-display text-xl mb-2">
                                    <Calendar className="w-5 h-5 text-orange" /> Date
                                </label>
                                <Input type="datetime-local" {...register("date")} required />
                            </div>
                        </div>

                        <div>
                            <label className="font-display text-xl mb-2 block">Description</label>
                            <textarea 
                                {...register("description")} 
                                className="w-full border-2 border-black bg-white p-4 text-lg min-h-[120px] focus:outline-none focus:shadow-[4px_4px_0px_0px_#FA8112] transition-all font-sans"
                                placeholder="Tell us the wondrous details..."
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Visuals & Location */}
                <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* Image Upload (Retro Style) */}
                    <div className="bg-beige border-2 border-black shadow-[8px_8px_0px_0px_#222] p-8">
                        <label className="flex items-center gap-2 font-display text-xl mb-4">
                            <ImageIcon className="w-5 h-5 text-black" /> Cover Image
                        </label>
                        <Input {...register("image_url")} placeholder="https://..." className="bg-white" />
                        <div className="mt-4 border-2 border-dashed border-black/30 h-32 flex items-center justify-center bg-black/5">
                            <span className="font-accent text-black/40 uppercase tracking-widest">Preview Area</span>
                        </div>
                    </div>

                    {/* Price Ticket */}
                    <div className="bg-orange border-2 border-black shadow-[8px_8px_0px_0px_#222] p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-black/10"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/10"></div>
                        
                        <label className="font-display text-2xl text-white mb-2 drop-shadow-md">Ticket Price</label>
                        <div className="relative w-full max-w-[150px]">
                            <span className="absolute left-3 top-2.5 text-xl font-bold">₹</span>
                            <Input 
                                type="number" 
                                {...register("price")} 
                                defaultValue={0} 
                                className="pl-8 text-center text-2xl font-bold bg-white shadow-none focus:shadow-none" 
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: The Map */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#222] p-2">
                    <div className="bg-black text-cream p-3 flex justify-between items-center">
                        <span className="font-display text-xl tracking-widest uppercase">Select Location</span>
                        <MapPin className="w-5 h-5 text-orange" />
                    </div>
                    
                    <div className="h-80 w-full relative z-0">
                        <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={false} className="h-full w-full">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker setLocation={(loc) => setValue('location', loc)} />
                        </MapContainer>
                    </div>
                    
                    <div className="p-4 border-t-2 border-black bg-beige">
                        <label className="block font-accent uppercase text-xs mb-2">Selected Address</label>
                        <Input {...register("location")} required placeholder="Click on map to set..." className="bg-white" />
                    </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end pt-4">
                    {/* CONDITIONAL BUTTON RENDERING */}
                    {!planLoading && eventCount >= maxEvents ? (
                         <div className="flex flex-col items-end gap-2">
                             <Button type="button" onClick={() => navigate("/pricing")} size="lg" className="text-xl px-12 py-6 bg-gray-200 text-gray-500 border-gray-300 hover:bg-gray-200 cursor-not-allowed">
                                Limit Reached (Max 1)
                             </Button>
                             <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Upgrade to create more events</p>
                         </div>
                    ) : (
                        <Button type="submit" disabled={loading} size="lg" className="text-xl px-12 py-6">
                            {loading ? "Summoning..." : "Publish Spectacle"}
                        </Button>
                    )}
                </div>

            </form>
        </div>
      </div>
    </div>
  );
}