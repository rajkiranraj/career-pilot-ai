import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cfdeezetumyauwwqudha.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZGVlemV0dW15YXV3d3F1ZGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1Mzk4NTcsImV4cCI6MjA5MzExNTg1N30.d-eOkwqJjTSLMEBRFq2hVWniezH0W2aYBKYU81nW_NU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'onboardtest2@example.com',
    password: 'TestPassword123!',
  })
  
  if (error) {
    console.error('Login error:', error)
    return
  }
  
  console.log('Logged in!')
  const token = data.session.access_token
  
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/generate-insights`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const text = await res.text()
    console.log('Status:', res.status)
    console.log('Response:', text)
  } catch (err) {
    console.error('Fetch error:', err)
  }
}

test()
