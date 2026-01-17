import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditEvent() {
  const { id } = useParams();
  const { register, handleSubmit, setValue } = useForm();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Load Event Data
  useEffect(() => {
    async function loadEvent() {
      if(!user) return;
      
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('organizer_id', user.id) // Security check
        .single();
        
      if (data) {
        setValue("title", data.title);
        setValue("description", data.description);
        setValue("date", data.date); // Might need formatting depending on DB format
        setValue("location", data.location);
        setValue("price", data.price);
        setValue("category", data.category);
        setValue("image_url", data.image_url);
      } else {
          alert("Event not found or access denied.");
          navigate('/dashboard/overview');
      }
      setFetching(false);
    }
    loadEvent();
  }, [id, user, setValue, navigate]);

  const onSubmit = async (formData: any) => {
    setLoading(true);
    const { error } = await supabase
      .from('events')
      .update({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        price: formData.price,
        category: formData.category,
        image_url: formData.image_url,
      })
      .eq('id', id);

    setLoading(false);
    if (!error) navigate('/dashboard/overview');
    else alert(error.message);
  };

  if (fetching) return <div className="min-h-screen bg-cream flex items-center justify-center">Loading Event...</div>;

  return (
    <div className="flex min-h-screen bg-cream font-sans text-black">
      <DashboardNav />
      <div className="ml-64 flex-1 p-12">
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/dashboard/overview')} className="p-0 hover:bg-transparent hover:text-orange">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h2 className="text-4xl font-display">Edit Spectacle</h2>
                    <p className="text-black/50">Update details for your live event page.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white border-2 border-black p-10 shadow-[8px_8px_0px_0px_#222]">
                
                {/* Title */}
                <div>
                    <label className="block font-bold uppercase text-xs mb-2 tracking-widest text-black/60">Event Title</label>
                    <Input {...register("title")} required className="text-lg font-display" />
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="block font-bold uppercase text-xs mb-2 tracking-widest text-black/60">Category</label>
                        <select {...register("category")} className="w-full h-12 border-2 border-black px-4 bg-cream text-lg font-sans focus:outline-none focus:shadow-[4px_4px_0px_0px_#FA8112]">
                            <option value="Music">Music & Concerts</option>
                            <option value="Tech">Technology</option>
                            <option value="Art">Art & Theatre</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Social">Social</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold uppercase text-xs mb-2 tracking-widest text-black/60">Date & Time</label>
                        <Input type="datetime-local" {...register("date")} required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                     <div>
                        <label className="block font-bold uppercase text-xs mb-2 tracking-widest text-black/60">Price (₹)</label>
                        <Input type="number" {...register("price")} />
                    </div>
                    <div>
                        <label className="block font-bold uppercase text-xs mb-2 tracking-widest text-black/60">Cover Image URL</label>
                        <Input {...register("image_url")} placeholder="https://..." />
                    </div>
                </div>

                <div>
                    <label className="block font-bold uppercase text-xs mb-2 tracking-widest text-black/60">Location</label>
                    <Input {...register("location")} required />
                </div>

                <div>
                    <label className="block font-bold uppercase text-xs mb-2 tracking-widest text-black/60">Description</label>
                    <textarea 
                        {...register("description")} 
                        className="w-full border-2 border-black p-4 min-h-[150px] font-sans text-lg focus:outline-none focus:shadow-[4px_4px_0px_0px_#FA8112] transition-all" 
                    />
                </div>

                <div className="pt-6 flex justify-between items-center border-t-2 border-black/5">
                    <Button type="button" variant="danger" onClick={() => navigate('/dashboard/overview')} className="bg-transparent text-red-600 border-none shadow-none hover:bg-red-50 hover:shadow-none px-0">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} size="lg" className="bg-black text-white hover:bg-orange border-none shadow-[4px_4px_0px_0px_#222]">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}