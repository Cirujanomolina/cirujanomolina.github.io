const url = 'https://flwrvejerzwewmiivqtn.supabase.co/rest/v1/colaboradores?select=count';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3J2ZWplcnp3ZXdtaWl2cXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjA5NzQsImV4cCI6MjA5NTEzNjk3NH0.MI_eYwpAQERGAyQYZAIyFdvXT_SYyn8Z_Jte46NFMRQ';

async function check() {
    try {
        const res = await fetch(url, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        console.log('Status for colaboradores:', res.status);
        if (res.status === 404) {
            console.log('Table colaboradores does NOT exist.');
        } else {
            console.log('Table colaboradores exists (or other status).');
            const data = await res.json();
            console.log('Response data:', data);
        }

        const logRes = await fetch('https://flwrvejerzwewmiivqtn.supabase.co/rest/v1/audit_logs?select=count', {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        console.log('Status for audit_logs:', logRes.status);
    } catch (err) {
        console.error('Error testing:', err);
    }
}
check();
