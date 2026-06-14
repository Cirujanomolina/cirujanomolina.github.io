const url = 'https://flwrvejerzwewmiivqtn.supabase.co/rest/v1/ideas?select=*';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3J2ZWplcnp3ZXdtaWl2cXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjA5NzQsImV4cCI6MjA5NTEzNjk3NH0.MI_eYwpAQERGAyQYZAIyFdvXT_SYyn8Z_Jte46NFMRQ';

console.log('Fetching Supabase REST API...');

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(async (res) => {
  console.log('Status:', res.status);
  console.log('Status Text:', res.statusText);
  try {
    const text = await res.text();
    console.log('Response body:', text);
  } catch (e) {
    console.log('Error reading text:', e);
  }
})
.catch(err => {
  console.error('Fetch error:', err);
});
