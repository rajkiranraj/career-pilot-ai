import { supabase } from '../lib/supabase';

export const getResume = async () => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return { success: true, data: data || null };
};

export const saveResume = async (content) => {
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from('resumes')
    .insert({ user_id: session?.user?.id, content })
    .select()
    .single();
    
  if (error) throw error;
  return { success: true, data };
};

export const improveResumeContent = async (current, type) => {
  const { data, error } = await supabase.functions.invoke('improve-resume', {
    body: { resumeContent: current, type }
  });
  
  if (error) throw error;
  return { success: true, data };
};
