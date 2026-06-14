with open(r"c:\Users\Juan\Segundo Cerebro\Hobbies y proyectos\Aplicaciones\Content OS\modules\analisis.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "toFixed" in line and ("cpl" in line.lower() or "budget" in line.lower() or "spend" in line.lower()):
        print(f"Line {i+1}: {line.strip()}")
