import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

const supabaseUrl = 'https://flwrvejerzwewmiivqtn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3J2ZWplcnp3ZXdtaWl2cXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjA5NzQsImV4cCI6MjA5NTEzNjk3NH0.MI_eYwpAQERGAyQYZAIyFdvXT_SYyn8Z_Jte46NFMRQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper para testear conexión
export async function testConnection() {
    const { data, error } = await supabase.from('ideas').select('count', { count: 'exact', head: true });
    if (error) {
        console.error("❌ Supabase connection error:", error.message);
        return false;
    }
    console.log("✅ Supabase connected");
    return true;
}
