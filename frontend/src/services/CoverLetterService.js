import api, { resolveApiData } from "./api";
import { isLaravelMode } from "../lib/backendMode";
import { supabase } from "../lib/supabase";

export const getCoverLetters = async () => {
  if (isLaravelMode()) {
    const response = await api.get("/cover-letter");
    return { success: true, data: resolveApiData(response) };
  }

  const { data, error } = await supabase
    .from('cover_letters')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return { success: true, data };
};

export const generateCoverLetter = async (requestData) => {
  if (isLaravelMode()) {
    const response = await api.post("/cover-letter/generate", requestData);
    return { success: true, data: resolveApiData(response) };
  }

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
  if (isLaravelMode()) {
    const response = await api.get(`/cover-letter/${id}`);
    return { success: true, data: resolveApiData(response) };
  }

  const { data, error } = await supabase
    .from('cover_letters')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return { success: true, data };
};

export const updateCoverLetter = async (id, content) => {
  if (isLaravelMode()) {
    const response = await api.patch(`/cover-letter/${id}`, { content });
    return { success: true, data: resolveApiData(response) };
  }

  const { data, error } = await supabase
    .from('cover_letters')
    .update({ content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
};

export const deleteCoverLetter = async (id) => {
  if (isLaravelMode()) {
    const response = await api.delete(`/cover-letter/${id}`);
    return { success: true, data: resolveApiData(response) };
  }

  const { error } = await supabase
    .from('cover_letters')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return { success: true };
};
