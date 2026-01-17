import { Link } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button } from "../ui/Button";

export default function MarketingNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-black/5 bg-cream/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-black text-orange flex items-center justify-center rounded-lg border border-black group-hover:rotate-12 transition-transform">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <span className="font-display text-2xl text-black tracking-tight">
            EventSnap
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/explore" className="font-sans text-sm font-bold uppercase tracking-widest text-black/60 hover:text-orange transition-colors">
            Explore
          </Link>
          <Link to="/pricing" className="font-sans text-sm font-bold uppercase tracking-widest text-black/60 hover:text-orange transition-colors">
            Pricing
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link to="/dashboard/overview">
              <Button variant="ghost" className="hidden sm:inline-flex">Dashboard</Button>
            </Link>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <Link to="/sign-in" className="hidden sm:inline-block font-sans font-bold text-sm text-black hover:text-orange mr-2">
              Login
            </Link>
            <Link to="/sign-up">
              <Button size="md" className="rounded-full bg-black text-white hover:bg-orange border-transparent shadow-lg shadow-black/20">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}