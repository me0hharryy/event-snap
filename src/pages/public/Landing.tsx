import MarketingNav from "../../components/layout/MarketingNav";
import Footer from "../../components/layout/Footer";
import Hero from "../../components/marketing/Hero";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Zap,  Globe, Smartphone } from "lucide-react";

export default function Landing() {
  return (
    <div className="bg-cream min-h-screen font-sans text-black selection:bg-orange selection:text-white overflow-x-hidden">
      <MarketingNav />
      <Hero />

      {/* SECTION: Infinite Marquee (Logos) */}
      <div className="py-10 border-b border-black/5 bg-white overflow-hidden">
         <p className="text-center text-xs font-bold uppercase tracking-widest text-black/30 mb-6">Powering next-gen events</p>
         <div className="relative flex overflow-x-hidden group">
            <div className="animate-marquee whitespace-nowrap flex gap-16 items-center opacity-50 grayscale hover:grayscale-0 transition-all">
               {["IndieHackers", "Dribbble", "ProductHunt", "TechCrunch", "Spotify", "Airbnb"].map((logo, i) => (
                  <span key={i} className="text-2xl font-display mx-4">{logo}</span>
               ))}
               {/* Duplicate for infinite loop */}
               {["IndieHackers", "Dribbble", "ProductHunt", "TechCrunch", "Spotify", "Airbnb"].map((logo, i) => (
                  <span key={`dup-${i}`} className="text-2xl font-display mx-4">{logo}</span>
               ))}
            </div>
         </div>
      </div>

      {/* SECTION: "The New Standard" (Grid) */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="mb-20 max-w-2xl">
              <h2 className="font-display text-6xl mb-6">The New Standard.</h2>
              <p className="text-xl text-black/60">Old event platforms are clunky and expensive. We built EventSnap to be the opposite.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white p-10 rounded-3xl border border-black/5 shadow-xl shadow-black/5 hover:-translate-y-2 transition-transform duration-500">
                 <div className="w-14 h-14 bg-orange/10 rounded-2xl flex items-center justify-center mb-6 text-orange">
                    <Zap className="w-7 h-7" />
                 </div>
                 <h3 className="font-display text-3xl mb-3">Lightning Fast</h3>
                 <p className="text-black/60">Optimized for speed. Your event page loads instantly, ensuring zero drop-off from impatient guests.</p>
              </div>

              {/* Card 2 */}
              <div className="bg-black text-cream p-10 rounded-3xl border border-black shadow-xl hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-orange rounded-full blur-[60px] opacity-30"></div>
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white relative z-10">
                    <Globe className="w-7 h-7" />
                 </div>
                 <h3 className="font-display text-3xl mb-3 relative z-10">Global Scale</h3>
                 <p className="text-white/60 relative z-10">Accept payments in 100+ currencies via Razorpay. We handle the tax and compliance logic.</p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-10 rounded-3xl border border-black/5 shadow-xl shadow-black/5 hover:-translate-y-2 transition-transform duration-500">
                 <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                    <Smartphone className="w-7 h-7" />
                 </div>
                 <h3 className="font-display text-3xl mb-3">Mobile First</h3>
                 <p className="text-black/60">QR Code check-ins and a responsive dashboard let you manage the door from your phone.</p>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION: CTA */}
      <section className="py-32 px-6 bg-orange text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-display text-7xl mb-8">Ready for the spotlight?</h2>
            <p className="text-xl opacity-90 mb-10">
               Join 10,000+ creators who trust EventSnap. Free forever for free events.
            </p>
            <Link to="/sign-up">
               <Button className="h-16 px-12 rounded-full bg-white text-black hover:bg-black hover:text-white border-none text-xl transition-all shadow-2xl">
                  Get Started Now
               </Button>
            </Link>
         </div>
      </section>

      <Footer />
    </div>
  );
}