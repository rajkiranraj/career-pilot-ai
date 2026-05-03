import { supabase } from '../lib/supabase';

export const getCoverLetters = async () => {
  const { data, error } = await supabase
    .from('cover_letters')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return { success: true, data };
};

export const generateCoverLetter = async (requestData) => {
  const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
    body: requestData
  });
  
  if (error) throw error;
  return { success: true, data: data.coverLetter };
};

export const getCoverLetter = async (id) => {
  const { data, error } = await supabase
    .from('cover_letters')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return { success: true, data };
};

export const deleteCoverLetter = async (id) => {
  const { error } = await supabase
    .from('cover_letters')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return { success: true };
};
