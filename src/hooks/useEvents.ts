import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "@clerk/clerk-react";
import type { AppEvent } from "../lib/types"; 

export function useEvents(publishedOnly = true) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('events').select('*');
      
      if (publishedOnly) {
        // Public Events: Don't wait for user
        query = query.eq('is_published', true);
      } else {
        // Dashboard Events: MUST wait for user
        if (!isLoaded || !user) {
            setLoading(false);
            return;
        }
        query = query.eq('organizer_id', user.id);
      }

      const { data, error: supabaseError } = await query.order('date', { ascending: true });
      
      if (supabaseError) {
          console.error("Supabase Error:", supabaseError);
          setError(supabaseError.message);
      } else {
          setEvents(data || []);
      }
    } catch (err: any) {
      console.error("Unexpected Error:", err);
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [publishedOnly, user, isLoaded]);

  useEffect(() => {
    // Only run fetch if:
    // 1. It's public (immediate)
    // 2. OR It's private AND user is loaded
    if (publishedOnly || (isLoaded && user)) {
        fetchEvents();
    }
  }, [fetchEvents, publishedOnly, isLoaded, user]);

  return { events, loading, error, refetch: fetchEvents };
}