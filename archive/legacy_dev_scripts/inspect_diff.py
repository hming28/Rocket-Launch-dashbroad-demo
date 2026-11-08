import re
import subprocess

# Let's inspect lines around line 198195 in v4
with open('AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

pos_target = v4.find('// Active, draft, and saved layouts management (Schema 2 §13.6)')
print("Found at:", pos_target)
pos_target_end = v4.find('let pubSettings =', pos_target)
print("End at:", pos_target_end)
print(v4[pos_target:pos_target_end])
