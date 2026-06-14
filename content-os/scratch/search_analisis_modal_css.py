with open(r"c:\Users\Juan\Segundo Cerebro\Hobbies y proyectos\Aplicaciones\Content OS\modules\analisis.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "toast" in line.lower() and ("{" in line or "." in line or "animation" in line):
        print(f"Line {i+1}: {line.strip().encode('ascii', 'replace').decode('ascii')}")
        for j in range(max(0, i-2), min(len(lines), i+15)):
            safe_l = lines[j].strip().encode('ascii', 'replace').decode('ascii')
            print(f"  Line {j+1}: {safe_l}")
        print()
