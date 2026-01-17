import MarketingNav from "../../components/layout/MarketingNav";
import { useEvents } from "../../hooks/useEvents";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Calendar, MapPin } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

export default function Explore() {
  const { events, loading } = useEvents(true);

  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingNav />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
        
        {loading ? <p>Loading...</p> : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((e) => (
              <Card key={e.id} className="p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">{e.title}</h3>
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">
                    {e.price === 0 ? "FREE" : formatCurrency(e.price)}
                  </span>
                </div>
                <div className="text-sm text-slate-500 space-y-2 mb-6">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {new Date(e.date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {e.location}</div>
                </div>
                <Button className="w-full">Register Now</Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}