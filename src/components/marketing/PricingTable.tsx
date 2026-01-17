import { Check } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export default function PricingTable() {
  return (
    <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
      {/* Starter Tier */}
      <Card className="bg-cream hover:bg-white transition-colors">
        <div className="mb-4 border-b-2 border-black pb-4">
          <h3 className="text-3xl font-display text-black">Apprentice</h3>
          <p className="text-black/70 font-accent text-lg mt-1">For local meetups.</p>
        </div>
        <div className="text-5xl font-display mb-8">₹0</div>
        
        <ul className="space-y-4 mb-8 flex-1 font-sans text-lg">
          <li className="flex gap-3"><Check className="w-5 h-5 text-orange" /> 1 Active Event</li>
          <li className="flex gap-3"><Check className="w-5 h-5 text-orange" /> 100 Attendees Max</li>
        </ul>
        
        <Button variant="outline" className="w-full">Start Free</Button>
      </Card>

      {/* Pro Tier */}
      <Card className="bg-orange text-white relative transform md:-translate-y-4">
        <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-4 py-2 border-l-2 border-b-2 border-white">
          MOST POPULAR
        </div>
        <div className="mb-4 border-b-2 border-black/20 pb-4">
          <h3 className="text-3xl font-display text-white drop-shadow-md">Ringmaster</h3>
          <p className="text-white/90 font-accent text-lg mt-1">For serious organizers.</p>
        </div>
        <div className="text-5xl font-display mb-8 text-white drop-shadow-md">₹999 <span className="text-xl font-sans font-normal opacity-80">/mo</span></div>
        
        <ul className="space-y-4 mb-8 flex-1 font-sans text-lg">
          <li className="flex gap-3"><Check className="w-5 h-5 text-black" /> Unlimited Events</li>
          <li className="flex gap-3"><Check className="w-5 h-5 text-black" /> 0% Commission</li>
          <li className="flex gap-3"><Check className="w-5 h-5 text-black" /> CSV Export</li>
        </ul>
        
        <Button className="w-full bg-black text-white border-white hover:bg-white hover:text-black">Upgrade Now</Button>
      </Card>
    </div>
  );
}