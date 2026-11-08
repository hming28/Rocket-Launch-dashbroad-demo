import re
import subprocess

with open('AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check for unclosed tags or syntax
scripts = re.findall(r'<script>(.*?)</script>', html, re.DOTALL)
print(f"Total script blocks: {len(scripts)}")

# Write JS to a temp file and check syntax with node
for i, s in enumerate(scripts):
    js_filename = f'temp_script_{i}.js'
    with open(js_filename, 'w', encoding='utf-8') as js_f:
        js_f.write(s)
    
    # Try running node --check
    try:
        res = subprocess.run(['node', '--check', js_filename], capture_output=True, text=True)
        print(f"Script {i} node check returncode: {res.returncode}")
        if res.returncode != 0:
            print("Stderr:", res.stderr[:1000])
        else:
            print("JavaScript syntax is valid!")
    except Exception as e:
        print("Node not available or error:", e)
