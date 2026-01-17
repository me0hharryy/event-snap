import { Check } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export default function PricingTable() {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Free Tier */}
      <Card className="p-8 flex flex-col hover:border-slate-300 transition-colors">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900">Starter</h3>
          <p className="text-slate-500 text-sm mt-2">For local meetups & hobbyists.</p>
        </div>
        <div className="text-4xl font-black mb-6">₹0</div>
        
        <ul className="space-y-4 mb-8 flex-1">
          <li className="flex gap-3 text-sm text-slate-600">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0" /> 1 Active Event
          </li>
          <li className="flex gap-3 text-sm text-slate-600">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0" /> 100 Attendees Max
          </li>
          <li className="flex gap-3 text-sm text-slate-600">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0" /> Standard Support
          </li>
        </ul>
        
        <Button variant="outline" className="w-full">Get Started Free</Button>
      </Card>

      {/* Pro Tier */}
      <Card className="p-8 flex flex-col border-blue-200 bg-blue-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          RECOMMENDED
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900">Pro Host</h3>
          <p className="text-slate-500 text-sm mt-2">For serious organizers.</p>
        </div>
        <div className="text-4xl font-black mb-6">₹999 <span className="text-lg font-normal text-slate-500">/mo</span></div>
        
        <ul className="space-y-4 mb-8 flex-1">
          <li className="flex gap-3 text-sm text-slate-700">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0" /> Unlimited Events
          </li>
          <li className="flex gap-3 text-sm text-slate-700">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0" /> Unlimited Attendees
          </li>
          <li className="flex gap-3 text-sm text-slate-700">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0" /> Export to CSV
          </li>
          <li className="flex gap-3 text-sm text-slate-700">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0" /> Priority Support
          </li>
        </ul>
        
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Upgrade to Pro</Button>
      </Card>
    </div>
  );
}