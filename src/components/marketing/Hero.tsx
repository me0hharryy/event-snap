import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Users, Zap } from "lucide-react";
import { Button } from "../ui/Button";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
          v2.0 Now Live: Multi-City Support
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight text-[#222222] sm:text-7xl mb-8 instrument-serif-regular">
          Host memorable events <br />
          <span className="text-[#FA8112] relative instrument-serif-regular-italic">
            without the chaos
            {/* SVG Underline Decoration */}
            <svg className="absolute -bottom-2 w-full h-4  text-[#F5E7C6] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
               <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto max-w-2xl text-xl text-slate-500 mb-10">
          EventSnap gives you the superpowers to manage registration, 
          ticketing, and check-ins. All in one dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Link to="/sign-up">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              Start Hosting Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Demo Events
            </Button>
          </Link>
        </div>

        {/* Social Proof / Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-slate-100 pt-12">
          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-3 rounded-full mb-3">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-2xl">5 mins</h3>
            <p className="text-slate-500">To launch your first event</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-3 rounded-full mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-2xl">10k+</h3>
            <p className="text-slate-500">Attendees managed</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-3 rounded-full mb-3">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-2xl">Zero</h3>
            <p className="text-slate-500">Commission on Free Plans</p>
          </div>
        </div>
      </div>

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 mix-blend-multiply"></div>
         <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 mix-blend-multiply"></div>
      </div>
    </div>
  );
}