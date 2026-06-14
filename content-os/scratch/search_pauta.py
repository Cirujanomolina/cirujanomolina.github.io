import re

with open(r"c:\Users\Juan\Segundo Cerebro\Hobbies y proyectos\Aplicaciones\Content OS\modules\pauta.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("=== SEARCHING USD ===")
for i, line in enumerate(lines):
    if "USD" in line or "usd" in line:
        print(f"Line {i+1}: {line.strip()}")

print("\n=== SEARCHING SEED_CAMPAIGNS ===")
for i, line in enumerate(lines):
    if "SEED" in line or "campaign" in line.lower() and "const" in line:
        print(f"Line {i+1}: {line.strip()}")

print("\n=== SEARCHING toFixed ===")
count = 0
for i, line in enumerate(lines):
    if "toFixed" in line:
        count += 1
        if count <= 30:
            print(f"Line {i+1}: {line.strip()}")
