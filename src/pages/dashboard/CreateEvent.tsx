import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function CreateEvent() {
  const { register, handleSubmit } = useForm();
  const { user } = useUser();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    if (!user) return;
    const { error } = await supabase.from('events').insert({
      organizer_id: user.id,
      title: data.title,
      date: data.date,
      location: data.location,
      price: data.price,
      is_published: true
    });
    if (!error) navigate('/dashboard/overview');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardNav />
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-200">
          <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Event Title</label>
              <Input {...register("title")} required placeholder="e.g. React India Meetup" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input type="datetime-local" {...register("date")} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <Input type="number" {...register("price")} defaultValue={0} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input {...register("location")} required placeholder="City or Venue" />
            </div>
            <Button type="submit" className="w-full">Publish Event</Button>
          </form>
        </div>
      </div>
    </div>
  );
}