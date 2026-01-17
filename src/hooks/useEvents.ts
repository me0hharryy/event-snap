import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "@clerk/clerk-react";
// We are importing 'AppEvent' exactly as exported above
import type { AppEvent } from "../lib/types"; 

export function useEvents(publishedOnly = true) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchEvents = async () => {
      let query = supabase.from('events').select('*');
      
      if (publishedOnly) {
        query = query.eq('is_published', true);
      } else if (user) {
        // Fetch only MY events if looking at dashboard
        query = query.eq('organizer_id', user.id);
      }

      const { data, error } = await query.order('date', { ascending: true });
      if (!error && data) setEvents(data);
      setLoading(false);
    };

    fetchEvents();
  }, [publishedOnly, user]);

  return { events, loading };
}