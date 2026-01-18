import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react"; 
import { usePlan } from "../../hooks/usePlan"; // <--- IMPORT HOOK
import MarketingNav from "../../components/layout/MarketingNav";
import { Button } from "../../components/ui/Button";
import { Check, Loader2, Crown } from "lucide-react";

export default function Pricing() {
  const { user, isSignedIn } = useUser();
  const { isPro, loading: planLoading } = usePlan(); // <--- CHECK PLAN STATUS
  const [loading, setLoading] = useState<string | null>(null);

  // PayU Form State
  const payuFormRef = useRef<HTMLFormElement>(null);
  const [payuData, setPayuData] = useState<any>(null);

  useEffect(() => {
    if (payuData && payuFormRef.current) {
        payuFormRef.current.submit();
    }
  }, [payuData]);

  const handlePurchase = async (planName: string, price: number) => {
    if (!isSignedIn) {
        window.location.href = "/sign-up";
        return;
    }
    
    // Safety check (should be handled by UI, but good to have)
    if (planName === 'apprentice' && !isPro) return;
    if (planName === 'maestro' && isPro) return;

    setLoading(planName);

    try {
        const res = await fetch('/api/create-payu-hash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'plan',
                planName: planName,
                amount: price,
                userId: user.id,
                userEmail: user.primaryEmailAddress?.emailAddress,
                userName: user.fullName || "User",
                phone: "9999999999" 
            })
        });

        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setPayuData(result);

    } catch (err: any) {
        alert("Payment Error: " + err.message);
        setLoading(null);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <MarketingNav />

      {/* Hidden Form for PayU Redirect */}
      {payuData && (
          <form action={payuData.action} method="post" ref={payuFormRef} className="hidden">
            <input type="hidden" name="key" value={payuData.key} />
            <input type="hidden" name="txnid" value={payuData.txnid} />
            <input type="hidden" name="productinfo" value={payuData.productinfo} />
            <input type="hidden" name="amount" value={payuData.amount} />
            <input type="hidden" name="email" value={payuData.email} />
            <input type="hidden" name="firstname" value={payuData.firstname} />
            <input type="hidden" name="phone" value={payuData.phone} />
            <input type="hidden" name="surl" value={payuData.surl} />
            <input type="hidden" name="furl" value={payuData.furl} />
            <input type="hidden" name="hash" value={payuData.hash} />
          </form>
      )}
      
      <div className="max-w-7xl mx-auto px-6 py-24">
        
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h1 className="font-display text-6xl text-black mb-6">
            Membership
          </h1>
          <p className="font-sans text-xl text-black/60">
            Choose how you want to manage your audience. <br/> 
            Fair pricing, zero hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 border-t border-b border-black">
          
          {/* Plan 1: Free */}
          <div className="p-12 md:p-16 border-r border-black/10 hover:bg-white/50 transition-colors flex flex-col items-start relative">
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

            {/* FREE PLAN BUTTON LOGIC */}
            {isSignedIn && !isPro ? (
                <Button disabled className="w-full py-6 bg-gray-200 text-gray-500 border-gray-300">
                   Current Plan
                </Button>
            ) : isSignedIn && isPro ? (
                 <Button disabled className="w-full py-6 bg-transparent border-black/20 text-black/40">
                   Downgrade
                </Button>
            ) : (
                <Button 
                    variant="outline" 
                    className="w-full py-6"
                    onClick={() => window.location.href = '/sign-up'}
                >
                    Get Started
                </Button>
            )}
          </div>

          {/* Plan 2: Pro */}
          <div className="p-12 md:p-16 bg-black text-cream flex flex-col items-start relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange rounded-full blur-2xl opacity-20"></div>

            <div className="font-accent text-orange uppercase tracking-widest mb-4 flex items-center gap-2">
                The Maestro {isPro && <Crown className="w-4 h-4 text-orange" />}
            </div>
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

            {/* PRO PLAN BUTTON LOGIC */}
            {isSignedIn && isPro ? (
                 <Button disabled className="w-full py-6 bg-orange text-black border-orange opacity-100 font-bold">
                   <Check className="w-4 h-4 mr-2" /> Active Plan
                </Button>
            ) : (
                <Button 
                    variant="primary" 
                    className="w-full py-6 bg-cream text-black hover:bg-orange hover:text-black border-transparent"
                    disabled={loading === 'maestro'}
                    onClick={() => handlePurchase('maestro', 999)}
                >
                    {loading === 'maestro' ? <Loader2 className="animate-spin" /> : "Go Pro"}
                </Button>
            )}
          </div>

        </div>

        <div className="mt-24 text-center border border-black/10 p-12">
           <h3 className="font-display text-2xl mb-4">Need a Custom Enterprise Plan?</h3>
           <p className="font-sans text-black/60 mb-6">We handle massive scale for festivals and conferences.</p>
           <a href="mailto:sales@eventsnap.com" className="font-accent uppercase text-orange hover:text-black tracking-widest border-b border-orange hover:border-black transition-colors pb-1">Contact Sales</a>
        </div>

      </div>
    </div>
  );
}