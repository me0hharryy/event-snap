import MarketingNav from "../../components/layout/MarketingNav";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingNav />
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 text-left">
            <h3 className="text-xl font-bold">Starter</h3>
            <div className="text-3xl font-black mt-2 mb-6">₹0</div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-2"><Check className="w-5 h-5 text-green-500"/> 1 Active Event</li>
              <li className="flex gap-2"><Check className="w-5 h-5 text-green-500"/> 5% Platform Fee</li>
            </ul>
            <Button variant="outline" className="w-full">Get Started</Button>
          </Card>
          <Card className="p-8 text-left border-blue-200 ring-4 ring-blue-50">
            <h3 className="text-xl font-bold">Pro</h3>
            <div className="text-3xl font-black mt-2 mb-6">₹999<span className="text-sm text-slate-400 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-2"><Check className="w-5 h-5 text-blue-500"/> Unlimited Events</li>
              <li className="flex gap-2"><Check className="w-5 h-5 text-blue-500"/> 0% Platform Fee</li>
            </ul>
            <Button className="w-full">Upgrade</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}