import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

const supabaseUrl = 'https://flwrvejerzwewmiivqtn.supabase.co';
const supabaseKey = 'sb_publishable_-LlO_85h1sVvVCQa6ez4RQ_iiazxHyw'; // <-- reemplaza esto por tu sb_publishable_... real

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