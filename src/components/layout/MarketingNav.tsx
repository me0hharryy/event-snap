import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button } from "../ui/Button";

export default function MarketingNav() {
  return (
    <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Zap className="w-5 h-5 fill-blue-600 text-blue-600" />
          EventSnap
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/explore" className="text-sm font-medium text-slate-600 hover:text-black">Explore</Link>
          <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-black">Pricing</Link>
          
          <SignedIn>
            <Link to="/dashboard/overview">
              <Button variant="ghost">Go to Dashboard</Button>
            </Link>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <Link to="/sign-in">
              <Button variant="outline" size="sm">Log In</Button>
            </Link>
            <Link to="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}