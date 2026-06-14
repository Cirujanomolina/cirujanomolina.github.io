import urllib.request
import json

url = 'https://flwrvejerzwewmiivqtn.supabase.co/rest/v1/ideas?select=*&limit=5'
headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3J2ZWplcnp3ZXdtaWl2cXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjA5NzQsImV4cCI6MjA5NTEzNjk3NH0.MI_eYwpAQERGAyQYZAIyFdvXT_SYyn8Z_Jte46NFMRQ',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3J2ZWplcnp3ZXdtaWl2cXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjA5NzQsImV4cCI6MjA5NTEzNjk3NH0.MI_eYwpAQERGAyQYZAIyFdvXT_SYyn8Z_Jte46NFMRQ'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = response.read().decode('utf-8')
        print("Response data:")
        print(json.dumps(json.loads(data), indent=2))
except Exception as e:
    print("Error:", e)
