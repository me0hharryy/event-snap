import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
//import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {  AlertTriangle, Lock,  } from "lucide-react";

export default function EditEvent() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ticketCount, setTicketCount] = useState<number | null>(null);
  
  const { register, handleSubmit, reset, setValue } = useForm();

  // 1. Fetch Event & Initial Count
  useEffect(() => {
    async function fetchEvent() {
      if (!user || !id) return;

      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      
      if (error || !data) {
          navigate('/dashboard/overview');
          return;
      }

      if(data.organizer_id !== user.id) {
          alert("Unauthorized");
          navigate('/dashboard/overview');
          return;
      }

      // Populate Form
      const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : "";
      reset({
          title: data.title,
          description: data.description,
          location: data.location,
          price: data.price,
          category: data.category
      });
      setValue("date", formattedDate);

      // Initial Count Check (Visual Only)
      checkTicketCount();
    }
    fetchEvent();
  }, [id, user, reset, setValue, navigate]);

  async function checkTicketCount() {
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);
      setTicketCount(count || 0);
  }

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
        const { error } = await supabase
            .from('events')
            .update({
                title: data.title,
                description: data.description,
                date: data.date,
                location: data.location,
                category: data.category
            })
            .eq('id', id);

        if (error) throw error;
        navigate('/dashboard/overview');
    } catch (err: any) {
        alert("Update failed: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleCancelEvent = async () => {
      const confirm = window.confirm(
          "⚠️ ARE YOU SURE?\n\n" + 
          "This will STOP all ticket sales immediately.\n" +
          "You cannot undo this easily."
      );
      if (!confirm) return;

      setLoading(true);
      // Update the status to 'cancelled'
      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
          alert("Error: " + error.message);
      } else {
          alert("Event marked as CANCELLED.");
          navigate('/dashboard/overview');
      }
      setLoading(false);
  };
  // --- SAFE DELETE LOGIC ---
  const handleDelete = async () => {
      // 1. Frontend Pre-Check (Soft Block)
      if (ticketCount && ticketCount > 0) {
          alert(`⛔️ BLOCKED: This event has ${ticketCount} sold tickets.\n\nYou cannot delete an event that people have paid for.`);
          return;
      }

      const confirm = window.confirm(
          "Are you sure you want to delete this event?\n\nThis action cannot be undone."
      );
      if (!confirm) return;

      setLoading(true);

      // 2. Database Delete Attempt
      const { error } = await supabase.from('events').delete().eq('id', id);
      
      if (error) {
          // Check for BOTH the error code AND the specific constraint name
          const isForeignKeyError = 
            error.code === '23503' || 
            error.message.includes('registrations already recieved') ||
            error.message.includes("Can't Delete");

          if (isForeignKeyError) {
             alert(
                 "⛔️ DELETION FAILED\n\n" +
                 "Tickets have been sold for this event. The system has blocked deletion to prevent data loss.\n" + 
                 "Please Cancel the event instead."
             );
          } else {
             alert("Error: " + error.message);
          }
      } else {
          navigate('/dashboard/overview');
      }
      setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-cream font-sans">
      <DashboardNav />
      <div className="flex-1 p-8 md:p-12 md:ml-64">
        <h1 className="text-4xl font-display mb-8">Edit Event</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8 bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            
            <div className="w-full">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Event Title</label>
                <Input {...register("title")} />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div className="w-full">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Date</label>
                    <input type="date" {...register("date")} className="w-full bg-white border-2 border-black/10 px-4 py-3 font-medium outline-none focus:border-black" />
                </div>
                <div className="w-full">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Location</label>
                    <Input {...register("location")} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                 <div className="relative opacity-60 cursor-not-allowed">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60 flex items-center gap-1">
                        Price (Locked) <Lock className="w-3 h-3" />
                    </label>
                    <input {...register("price")} disabled className="w-full bg-gray-100 border-2 border-black/10 px-4 py-3 font-medium outline-none text-gray-500 cursor-not-allowed" />
                 </div>

                 <div className="relative">
                     <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Category</label>
                     <select {...register("category")} className="w-full bg-white border-2 border-black/10 px-4 py-3 font-medium outline-none focus:border-black appearance-none">
                        <option>Music</option>
                        <option>Tech</option>
                        <option>Business</option>
                        <option>Art</option>
                        <option>Social</option>
                     </select>
                </div>
            </div>
            
            <div className="w-full">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Description</label>
                <textarea {...register("description")} className="w-full h-32 bg-white border-2 border-black/10 px-4 py-3 resize-none focus:border-black outline-none transition-all" />
            </div>

            {/* DANGER ZONE */}
            {/* DANGER ZONE UI */}
            <div className="bg-red-50 p-6 border-2 border-red-100 mt-12 rounded-xl">
                <h3 className="text-red-800 font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h3>
                
                {/* Cancel Option */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-sm font-bold text-red-900">Cancel Event</p>
                        <p className="text-xs text-red-700 opacity-70">Stops ticket sales immediately. Event remains visible but inactive.</p>
                    </div>
                    <button 
                        type="button"
                        onClick={handleCancelEvent}
                        className="bg-white border border-red-200 text-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors"
                    >
                        Mark Cancelled
                    </button>
                </div>

                <div className="h-[1px] bg-red-200 my-4"></div>

                {/* Existing Delete Option (Keep your existing delete logic here) */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-red-900">Delete Event</p>
                        <p className="text-xs text-red-700 opacity-70">Permanently remove. Only allowed if 0 tickets sold.</p>
                    </div>
                     {/* ... your existing Delete Button logic ... */}
                     <button type="button" onClick={handleDelete} className="...">Delete</button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}