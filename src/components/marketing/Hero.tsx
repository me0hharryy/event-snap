import { Link } from "react-router-dom";
import {  CheckCircle, Zap, TrendingUp } from "lucide-react";
import { Button } from "../ui/Button";
import { useState, useRef, type MouseEvent } from "react";

export default function Hero() {
  // Parallax Logic
  const boundingRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 12, y: 0 }); // Start with the 12deg tilt

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!boundingRef.current) return;
    const rect = boundingRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on cursor position relative to center
    const xPct = x / rect.width - 0.5;
    const yPct = y / rect.height - 0.5;

    // Limit rotation to avoid flipping (Max +/- 10deg)
    setRotation({
      x: 12 - yPct * 10, // Base 12deg - move up/down
      y: xPct * 10       // Move left/right
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 12, y: 0 }); // Reset to beautiful default
  };

  return (
    <div className="relative bg-cream border-b border-black/10 overflow-hidden font-sans">
      
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-0 relative z-10 text-center">
        
        {/* Social Proof Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-black/10 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-fade-in-up cursor-default hover:border-orange/30 transition-colors">
           <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full" />
                  </div>
              ))}
           </div>
           <span className="text-sm font-sans font-medium text-black/60 pl-2">
             Trusted by 2,000+ Organizers
           </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-7xl md:text-[6.5rem] leading-[0.95] text-black mb-8 tracking-tight">
           Craft Events That <br />
           <span className="text-orange italic font-body">Sell Out.</span>
        </h1>

        <p className="font-sans text-xl text-black/60 max-w-2xl mx-auto mb-10 leading-relaxed">
           The modern toolkit for creators. Launch beautiful event pages, 
           manage guest lists, and accept payments globally.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
           <Link to="/sign-up">
             <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-black text-white hover:bg-orange hover:scale-105 transition-all shadow-xl shadow-orange/20 border-none">
                Start Hosting for Free
             </Button>
           </Link>
           <div className="flex items-center gap-2 text-sm font-bold text-black/60 px-4">
              <CheckCircle className="w-4 h-4 text-green-500" /> No credit card required
           </div>
        </div>

        {/* --- 3D INTERACTIVE DASHBOARD --- */}
        <div 
            className="relative mx-auto max-w-5xl h-[500px] sm:h-[600px] perspective-3d"
            ref={boundingRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
           {/* The Moving Container */}
           <div 
              className="relative w-full h-full transition-transform duration-100 ease-out transform-style-3d"
              style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
              }}
           >
              {/* THE SCREEN */}
              <div className="absolute inset-x-4 sm:inset-x-12 top-0 bottom-0 bg-white rounded-t-2xl border-t border-x border-black/10 shadow-2xl overflow-hidden flex flex-col">
                  
                  {/* Browser Window Header */}
                  <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2 shrink-0">
                     <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                     </div>
                     <div className="mx-auto bg-gray-200 h-5 w-64 rounded-md opacity-50 text-[10px] flex items-center justify-center text-gray-500 font-sans">
                        eventsnap.com/dashboard
                     </div>
                  </div>

                  {/* Dashboard Content (Mini-Mockup) */}
                  <div className="flex-1 bg-gray-50/50 p-6 grid grid-cols-12 gap-6 overflow-hidden">
                      
                      {/* Sidebar */}
                      <div className="col-span-2 hidden sm:flex flex-col gap-4 border-r border-gray-200 pr-6">
                          <div className="h-8 w-8 bg-black rounded-lg mb-4 flex items-center justify-center text-orange"><Zap className="w-5 h-5 fill-current"/></div>
                          <div className="h-2 w-full bg-gray-200 rounded-full"></div>
                          <div className="h-2 w-2/3 bg-gray-200 rounded-full"></div>
                          <div className="h-2 w-3/4 bg-gray-200 rounded-full"></div>
                          <div className="mt-auto h-8 w-8 rounded-full bg-gray-300"></div>
                      </div>

                      {/* Main Content */}
                      <div className="col-span-12 sm:col-span-10 flex flex-col gap-6">
                          {/* Header Stats */}
                          <div className="flex gap-4">
                              {/* Card 1 */}
                              <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Revenue</div>
                                  <div className="text-2xl font-display text-black">₹12,450</div>
                                  <div className="text-[10px] text-green-600 flex items-center gap-1 mt-1 bg-green-50 w-fit px-1 rounded">
                                      <TrendingUp className="w-3 h-3" /> +12%
                                  </div>
                              </div>
                              {/* Card 2 */}
                              <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tickets</div>
                                  <div className="text-2xl font-display text-black">48/50</div>
                                  <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                                      <div className="h-full w-[96%] bg-orange rounded-full"></div>
                                  </div>
                              </div>
                              {/* Card 3 (Hidden on mobile) */}
                              <div className="hidden sm:block flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Views</div>
                                  <div className="text-2xl font-display text-black">1.2k</div>
                              </div>
                          </div>

                          {/* Big Chart Area */}
                          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden">
                              <div className="flex justify-between items-center mb-6">
                                  <div className="h-4 w-32 bg-gray-100 rounded"></div>
                                  <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
                              </div>
                              {/* CSS Chart */}
                              <div className="flex items-end gap-3 h-32 sm:h-48 w-full px-2">
                                  {[35, 55, 40, 70, 50, 85, 60, 95, 75, 50, 65, 90].map((h, i) => (
                                      <div 
                                        key={i} 
                                        className="flex-1 bg-orange rounded-t-sm hover:opacity-80 transition-opacity relative group" 
                                        style={{ height: `${h}%`, opacity: 0.2 + (i/20) }}
                                      >
                                          {/* Tooltip on hover */}
                                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                              {h * 10} Sales
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* FLOATING PARALLAX ELEMENT (Pop-out Notification) */}
              <div 
                className="absolute top-[20%] right-[10%] sm:right-[15%] bg-white p-4 rounded-xl border border-black/5 shadow-2xl flex items-center gap-4 z-20 animate-float"
                style={{
                    transform: 'translateZ(60px)', // Pushes it closer to camera
                }}
              >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                      <div className="text-xs text-gray-500 font-bold uppercase">Just Now</div>
                      <div className="text-sm font-bold text-black">New Ticket Sold!</div>
                      <div className="text-xs text-orange font-bold">+ ₹999.00</div>
                  </div>
              </div>

           </div>

           {/* Gradient Overlay for bottom fade */}
           <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cream to-transparent z-20 pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
}