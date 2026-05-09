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

  if (error) {
    let msg = error.message || 'Failed to generate cover letter';
    if (error.context && typeof error.context.json === 'function') {
      try {
        const errBody = await error.context.json();
        msg = errBody.error || msg;
      } catch (_) {
        /* ignore parse failure */
      }
    }
    throw new Error(msg);
  }

  if (!data?.coverLetter) {
    throw new Error('Invalid response from server');
  }

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
