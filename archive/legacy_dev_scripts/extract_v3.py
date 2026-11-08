with open('AETHER-9 飞行控制台 v3.html', 'r', encoding='utf-8') as f:
    v3 = f.read()

# Extract from updateContextModules to end of updateRightZone
pos1 = v3.find('function updateContextModules')
pos2 = v3.find('function updateTimeline')

print("=== v3 context and right zone code ===")
print(f"From {pos1} to {pos2} ({pos2-pos1} chars)")
v3_snippet = v3[pos1:pos2]

with open('v3_extracted_widgets.js', 'w', encoding='utf-8') as f:
    f.write(v3_snippet)

print("Saved v3_extracted_widgets.js")
