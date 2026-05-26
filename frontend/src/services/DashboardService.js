import api, { resolveApiData } from "./api";
import { isLaravelMode } from "../lib/backendMode";
import { supabase } from "../lib/supabase";

export const getIndustryInsights = async () => {
  if (isLaravelMode()) {
    const response = await api.get("/dashboard/insights");
    return { success: true, data: resolveApiData(response) };
  }


  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { success: false };

  const { data: profile } = await supabase
    .from('profiles')
    .select('industry')
    .eq('id', session.user.id)
    .single();

  if (!profile?.industry) return { success: true, data: null };


  const { data: cachedInsight } = await supabase
    .from('industry_insights')
    .select('*')
    .eq('industry', profile.industry)
    .single();

  if (cachedInsight) {
    return { success: true, data: cachedInsight };
  }

  // No cache hit — generate fresh via edge function
  try {
    const { data, error } = await supabase.functions.invoke('generate-insights');

    if (error) {
      console.error('Edge Function error:', error);

      throw new Error(
        typeof error === 'object' && error.message 
          ? error.message 
          : 'Failed to generate insights. Please try again.'
      );
    }

    return { success: true, data: data?.insights || null };
  } catch (err) {
    console.error('Insights generation failed:', err);
    throw err;
  }
};
