import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

export function usePlan() {
  const { user, isLoaded } = useUser();
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchPlan() {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) {
          setLoading(false);
          return;
      }

      // Check for active subscription
      const { data } = await supabase
        .from('subscriptions')
        .select('plan_name, end_date')
        .eq('user_email', email)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString()) // Not expired
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setPlan(data.plan_name.toLowerCase()); 
      }
      setLoading(false);
    }

    fetchPlan();
  }, [user, isLoaded]);

  const isPro = plan === 'pro' || plan === 'maestro'; // 'maestro' matches your UI text

  return {
    loading,
    planName: plan,
    isPro,
    // Dynamic Rules
    platformFee: isPro ? 0 : 0.15, // 0% for Pro, 15% for Free
    maxEvents: isPro ? 9999 : 1,   // 1 Event for Free
    canExportData: isPro,
  };
}