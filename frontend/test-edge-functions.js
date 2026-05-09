console.log("=== CareerPilot AI Edge Functions Test ===");
console.log("\n1. Checking environment variables:");
console.log("   - VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing");
console.log("   - VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing");
console.log("   - VITE_SUPABASE_FUNCTIONS_URL:", import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ? "✅ Set" : "ℹ️  Not set (using default)");

console.log("\n2. Checking Supabase client configuration:");
import { supabase } from "./src/lib/supabase";
console.log("   - Supabase client initialized:", !!supabase ? "✅" : "❌");

console.log("\n3. Available Edge Functions:");
const edgeFunctions = [
  "parse-resume",
  "improve-resume",
  "enhance-text",
  "generate-cover-letter",
  "generate-insights",
  "generate-quiz"
];
edgeFunctions.forEach(fn => console.log(`   - ${fn}`));

console.log("\n=== Test Complete ===");
console.log("\nTroubleshooting Tips:");
console.log("1. Make sure your .env file has valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
console.log("2. Ensure your Edge Functions are deployed: `supabase functions deploy`");
console.log("3. Check Edge Function logs in the Supabase Dashboard");
console.log("4. Verify the user is authenticated before calling Edge Functions");
