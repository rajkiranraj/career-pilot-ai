import { createClient } from '@supabase/supabase-js';

const url = "https://cfdeezetumyauwwqudha.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZGVlemV0dW15YXV3d3F1ZGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1Mzk4NTcsImV4cCI6MjA5MzExNTg1N30.d-eOkwqJjTSLMEBRFq2hVWniezH0W2aYBKYU81nW_NU";

const supabase = createClient(url, key);

async function test() {
  const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  });

  if (signInError) {
    console.error("Login failed:", signInError);
    return;
  }

  console.log("Logged in:", user.id);

  const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
    body: { amount: 999, planName: "Pro" },
  });

  console.log("Data:", data);
  console.log("Error:", error);
}

test();
