import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, Plus, Users, Zap } from "lucide-react";
import { cn } from "../../lib/utils";

export default function DashboardNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="h-screen w-64 bg-slate-900 text-white fixed left-0 top-0 flex flex-col p-4">
      <div className="flex items-center gap-2 font-bold text-xl px-2 mb-8">
        <Zap className="w-5 h-5 fill-blue-500 text-blue-500" />
        EventSnap
      </div>

      <div className="space-y-1 flex-1">
        <Link 
          to="/dashboard/overview" 
          className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive('overview') ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
        >
          <LayoutDashboard className="w-4 h-4" /> Overview
        </Link>
        <Link 
          to="/dashboard/events/new" 
          className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive('events') ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
        >
          <Plus className="w-4 h-4" /> Create Event
        </Link>
        <Link 
          to="/dashboard/attendees" 
          className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive('attendees') ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}
        >
          <Users className="w-4 h-4" /> Attendees
        </Link>
      </div>

      <div className="mt-auto px-2 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <UserButton showName />
        </div>
      </div>
    </div>
  );
}