import { useUser } from "@clerk/clerk-react";
import DashboardNav from "../../components/layout/DashboardNav";

export default function Overview() {
  const { user } = useUser();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardNav />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.firstName}</h1>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-sm font-medium">Total Revenue</div>
            <div className="text-3xl font-bold mt-2">₹12,450</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-sm font-medium">Tickets Sold</div>
            <div className="text-3xl font-bold mt-2">48</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-sm font-medium">Active Events</div>
            <div className="text-3xl font-bold mt-2">2</div>
          </div>
        </div>
      </div>
    </div>
  );
}