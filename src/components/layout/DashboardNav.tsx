import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, Plus, Users, Zap, ArrowLeft, Ticket } from "lucide-react";
import { cn } from "../../lib/utils";
import { QrCode } from "lucide-react";
import { Wallet } from "lucide-react";
export default function DashboardNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  const NavItem = ({ to, icon: Icon, label, activeKey }: any) => (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-lg font-accent tracking-wide transition-all border-2 border-transparent",
        isActive(activeKey) 
          ? "bg-orange text-white border-black shadow-[4px_4px_0px_0px_#222] translate-x-1" 
          : "text-black hover:text-orange hover:translate-x-1"
      )}
    >
      <Icon className="w-5 h-5" /> {label}
    </Link>
  );

  return (
    <div className="h-screen w-64 bg-cream text-black fixed left-0 top-0 flex flex-col border-r-2 border-black z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 font-display text-2xl px-6 py-8 text-orange drop-shadow-sm">
        <Zap className="w-6 h-6 fill-current" />
        EventSnap
      </div>

      {/* Nav Links */}
      <div className="space-y-2 px-4 flex-1">
        <NavItem to="/dashboard/overview" icon={LayoutDashboard} label="Overview" activeKey="overview" />
        <NavItem to="/dashboard/tickets" icon={Ticket} label="My Tickets" activeKey="tickets" />
        <NavItem to="/dashboard/events/new" icon={Plus} label="New Event" activeKey="events" />
        <NavItem to="/dashboard/attendees" icon={Users} label="Attendees" activeKey="attendees" />
        <NavItem to="/dashboard/wallet" icon={Wallet} label="Wallet" activeKey="wallet" />
        <NavItem to="/dashboard/scan" icon={QrCode} label="Scanner" activeKey="scan" />
      </div>

      {/* Footer */}
      <div className="mt-auto p-6 space-y-6">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black/60 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Website
        </Link>

        <div className="pt-6 border-t-2 border-black/10">
            <div className="flex items-center gap-3">
              <UserButton showName appearance={{ elements: { userButtonBox: "flex-row-reverse text-black font-sans" } }} />
            </div>
        </div>
      </div>
    </div>
  );
}