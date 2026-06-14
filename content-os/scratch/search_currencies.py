import re
import os

modules_dir = r"c:\Users\Juan\Segundo Cerebro\Hobbies y proyectos\Aplicaciones\Content OS\modules"
files = os.listdir(modules_dir)

for file in files:
    if not file.endswith(".html"):
        continue
    filepath = os.path.join(modules_dir, file)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    usd_matches = re.findall(r".{0,30}USD.{0,30}", content, re.IGNORECASE)
    usd_tags = [m.strip() for m in usd_matches]
    
    tofixed_matches = re.findall(r".{0,20}\.toFixed\([0-9]\).{0,20}", content)
    tofixed_tags = [m.strip() for m in tofixed_matches]
    
    if usd_tags or tofixed_tags:
        print(f"=== File: {file} ===")
        if usd_tags:
            print(f"  USD matches: {len(usd_tags)}")
            for tag in usd_tags[:5]:
                print(f"    - {tag}")
        if tofixed_tags:
            print(f"  toFixed matches: {len(tofixed_tags)}")
            for tag in tofixed_tags[:10]:
                print(f"    - {tag}")
