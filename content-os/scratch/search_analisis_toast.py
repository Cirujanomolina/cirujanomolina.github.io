with open(r"c:\Users\Juan\Segundo Cerebro\Hobbies y proyectos\Aplicaciones\Content OS\modules\analisis.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function showtoast" in line.lower() or "showtoast =" in line.lower():
        print(f"Line {i+1}: {line.strip()}")
        # print surrounding lines
        for j in range(max(0, i-5), min(len(lines), i+15)):
            print(f"  Line {j+1}: {lines[j].strip()}")
