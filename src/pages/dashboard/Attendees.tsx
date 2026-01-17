import DashboardNav from "../../components/layout/DashboardNav";

export default function Attendees() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardNav />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Attendee Database</h1>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Select an event to view attendees (Coming Soon in MVP v2)
        </div>
      </div>
    </div>
  );
}