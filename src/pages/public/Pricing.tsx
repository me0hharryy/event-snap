import MarketingNav from "../../components/layout/MarketingNav";
import { Button } from "../../components/ui/Button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  return (
    <div className="bg-cream min-h-screen">
      <MarketingNav />
      
      <div className="max-w-7xl mx-auto px-6 py-24">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h1 className="font-display text-6xl text-black mb-6">
            Membership
          </h1>
          <p className="font-sans text-xl text-black/60">
            Choose how you want to manage your audience. <br/> 
            Fair pricing, zero hidden fees.
          </p>
        </div>

        {/* Swiss Grid Pricing Table */}
        <div className="grid md:grid-cols-2 border-t border-b border-black">
          
          {/* Plan 1: Free */}
          <div className="p-12 md:p-16 border-r border-black/10 hover:bg-white/50 transition-colors flex flex-col items-start">
            <div className="font-accent text-orange uppercase tracking-widest mb-4">The Apprentice</div>
            <div className="font-display text-5xl mb-6">₹0</div>
            <p className="font-sans text-lg text-black/70 mb-12 h-16">
              Perfect for local meetups and community gatherings.
            </p>
            
            <ul className="space-y-4 mb-12 flex-1 w-full">
              {['1 Active Event', '100 Monthly Attendees', 'Standard Analytics'].map(feat => (
                <li key={feat} className="flex items-center gap-3 font-sans text-black/80 py-2 border-b border-black/5">
                  <Check className="w-5 h-5 text-black" /> {feat}
                </li>
              ))}
            </ul>

            <Link to="/sign-up" className="w-full">
              <Button variant="outline" className="w-full py-6">Get Started</Button>
            </Link>
          </div>

          {/* Plan 2: Pro */}
          <div className="p-12 md:p-16 bg-black text-cream flex flex-col items-start relative overflow-hidden">
             {/* Decorative 'Pro' Mark */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange rounded-full blur-2xl opacity-20"></div>

            <div className="font-accent text-orange uppercase tracking-widest mb-4">The Maestro</div>
            <div className="font-display text-5xl mb-6">₹999 <span className="text-2xl text-cream/40 font-sans">/mo</span></div>
            <p className="font-sans text-lg text-cream/70 mb-12 h-16">
              For professional organizers hosting at scale.
            </p>
            
            <ul className="space-y-4 mb-12 flex-1 w-full">
              {['Unlimited Events', 'Zero Commission Fees', 'Priority Support', 'Custom Branding'].map(feat => (
                <li key={feat} className="flex items-center gap-3 font-sans text-cream/90 py-2 border-b border-white/10">
                  <Check className="w-5 h-5 text-orange" /> {feat}
                </li>
              ))}
            </ul>

            <Link to="/sign-up" className="w-full">
              <Button variant="primary" className="w-full py-6 bg-cream text-black hover:bg-orange hover:text-black border-transparent">
                Go Pro
              </Button>
            </Link>
          </div>

        </div>

        {/* FAQ / Footer Note */}
        <div className="mt-24 text-center border border-black/10 p-12">
           <h3 className="font-display text-2xl mb-4">Need a Custom Enterprise Plan?</h3>
           <p className="font-sans text-black/60 mb-6">We handle massive scale for festivals and conferences.</p>
           <a href="mailto:sales@eventsnap.com" className="font-accent uppercase text-orange hover:text-black tracking-widest border-b border-orange hover:border-black transition-colors pb-1">Contact Sales</a>
        </div>

      </div>
    </div>
  );
}