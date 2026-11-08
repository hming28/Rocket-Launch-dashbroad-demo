with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

# List functions declared between 195685 and 236607
import re
text = v4[195685:236607]
fns = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', text)
print("Functions in 195685-236607:", fns)
