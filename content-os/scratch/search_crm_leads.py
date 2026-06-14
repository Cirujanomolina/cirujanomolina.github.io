with open(r"c:\Users\Juan\Segundo Cerebro\Hobbies y proyectos\Aplicaciones\Content OS\modules\crm-leads.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "lead-overlay" in line or "leadmodal" in line.lower() or "lead-modal" in line:
        print(f"Line {i+1}: {line.strip()}")
