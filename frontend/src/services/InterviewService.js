import api, { resolveApiData } from "./api";
import { isLaravelMode } from "../lib/backendMode";
import { supabase } from "../lib/supabase";

export const generateQuiz = async () => {
  if (isLaravelMode()) {
    const response = await api.get("/interview/quiz");
    return { success: true, data: resolveApiData(response) || [] };
  }

  const { data, error } = await supabase.functions.invoke('generate-quiz');
  if (error) throw error;
  return { success: true, data: data.questions || [] };
};

export const saveQuizResult = async (questions, answers, score) => {
  if (isLaravelMode()) {
    const response = await api.post("/interview/save-result", {
      questions,
      answers,
      score,
    });
    return { success: true, data: resolveApiData(response) };
  }

  const { data: { session } } = await supabase.auth.getSession();
  
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: session?.user?.id,
      questions: questions.map((q, i) => ({ ...q, userAnswer: answers[i] })),
      quiz_score: score,
      category: 'Technical'
    })
    .select()
    .single();
    
  if (error) throw error;
  return { success: true, data };
};

export const getAssessments = async () => {
  if (isLaravelMode()) {
    const response = await api.get("/interview/assessments");
    return { success: true, data: resolveApiData(response) };
  }

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return { success: true, data };
};
