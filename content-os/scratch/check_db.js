import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

const supabaseUrl = 'https://flwrvejerzwewmiivqtn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3J2ZWplcnp3ZXdtaWl2cXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjA5NzQsImV4cCI6MjA5NTEzNjk3NH0.MI_eYwpAQERGAyQYZAIyFdvXT_SYyn8Z_Jte46NFMRQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Querying ideas...");
  const { data, error } = await supabase.from('ideas').select('*').limit(5);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data:", JSON.stringify(data, null, 2));
  }
}

check();
